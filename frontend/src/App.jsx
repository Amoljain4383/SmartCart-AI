
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [query, setQuery] = useState("Sony WH-1000XM5");
  const [offers, setOffers] = useState([]);
  const [notice, setNotice] = useState("Search the demo catalogue to compare offers.");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("smartcart_token") || ""
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  const [users, setUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  async function loadAdminUsers(authToken) {
    setAdminLoading(true);

    try {
      const response = await fetch(`${API}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load users");
      }

      setUsers(data.users || []);
    } catch (error) {
      setNotice("Admin panel: " + error.message);
      setUsers([]);
    } finally {
      setAdminLoading(false);
    }
  }

  async function loadSession(authToken) {
    try {
      const response = await fetch(`${API}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error("Session expired");
      }

      const user = await response.json();
      setCurrentUser(user);

      if (user.is_admin) {
        await loadAdminUsers(authToken);
      }
    } catch (error) {
      localStorage.removeItem("smartcart_token");
      setToken("");
      setCurrentUser(null);
      setUsers([]);
      setNotice("Please sign in again.");
    }
  }

  useEffect(() => {
    if (token) {
      loadSession(token);
    } else {
      setCurrentUser(null);
      setUsers([]);
    }
  }, [token]);

  async function search(event) {
    event.preventDefault();

    if (query.trim().length < 2) return;

    setLoading(true);
    setNotice("");

    try {
      const response = await fetch(
        `${API}/api/products/search?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Search failed");
      }

      setOffers(data.offers || []);

      setNotice(
        data.count === 0
          ? `No matching demo products found for "${query}". Try Apple AirPods Pro 2 or Sony WH-1000XM5.`
          : data.notice || ""
      );
    } catch (error) {
      setNotice(error.message);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }

  async function authenticate(event) {
    event.preventDefault();

    const endpoint = authMode === "login" ? "login" : "register";

    const body =
      authMode === "login"
        ? { email, password }
        : { name, email, password };

    try {
      const response = await fetch(`${API}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      localStorage.setItem("smartcart_token", data.access_token);
      setCurrentUser(data.user);
      setToken(data.access_token);
      setPassword("");

      setNotice(
        `Welcome, ${data.user.name}. You are signed in.`
      );
    } catch (error) {
      setNotice(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("smartcart_token");
    setToken("");
    setCurrentUser(null);
    setUsers([]);
    setNotice("You have signed out.");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          SmartCart <span>AI</span>
        </a>

        <div className="account">
          {token ? (
            <button className="quiet" onClick={logout}>
              Sign out
            </button>
          ) : (
            <span className="muted">
              Smart shopping, made simple
            </span>
          )}
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">SMART SHOPPING ASSISTANT</p>

        <h1>
          Find the right product.
          <br />
          <span>Pay the right price.</span>
        </h1>

        <p className="intro">
          Compare offers in one place and see the lowest listed
          demo price, including known shipping.
        </p>

        <form className="search" onSubmit={search}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a product..."
            aria-label="Product search"
          />

          <button disabled={loading}>
            {loading ? "Searching..." : "Compare prices"}
          </button>
        </form>

        {notice && <p className="notice">{notice}</p>}
      </section>

      {offers.length > 0 && (
        <section className="results">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMPARISON</p>
              <h2>Available offers</h2>
            </div>

            <span className="muted">
              {offers.length} demo offers
            </span>
          </div>

          <div className="offer-list">
            {offers.map((offer, index) => (
              <article
                className={`offer ${index === 0 ? "best" : ""}`}
                key={offer.id}
              >
                <div>
                  <p className="retailer">
                    {offer.retailer}{" "}
                    {index === 0 && (
                      <span className="best-label">
                        Lowest total
                      </span>
                    )}
                  </p>

                  <h3>{offer.product}</h3>
                </div>

                <div className="price">
                  <strong>
                    ₹{(offer.price + offer.shipping).toLocaleString("en-IN")}
                  </strong>

                  <small>
                    Item ₹{offer.price.toLocaleString("en-IN")}
                    {" · "}
                    Shipping ₹{offer.shipping.toLocaleString("en-IN")}
                  </small>

                  <a href={offer.url} target="_blank" rel="noreferrer">
                    Demo link ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="auth-panel">
        <div>
          <p className="eyebrow">YOUR ACCOUNT</p>

          <h2>
            {token
              ? `Welcome, ${currentUser?.name || "User"}`
              : authMode === "login"
                ? "Welcome back"
                : "Create an account"}
          </h2>

          <p className="muted">
            {currentUser?.is_admin
              ? "Administrator account"
              : "Create a customer account or sign in to your existing account."}
          </p>
        </div>

        {!token && (
          <form className="auth-form" onSubmit={authenticate}>
            {authMode === "register" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                minLength="2"
                required
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              minLength="8"
              required
            />

            <button type="submit">
              {authMode === "login" ? "Sign in" : "Register"}
            </button>

            <button
              type="button"
              className="quiet"
              onClick={() =>
                setAuthMode(
                  authMode === "login" ? "register" : "login"
                )
              }
            >
              {authMode === "login"
                ? "Create a new account"
                : "I already have an account"}
            </button>
          </form>
        )}
      </section>

      {currentUser?.is_admin && (
        <section className="results">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ADMINISTRATION</p>
              <h2>Admin Dashboard</h2>
            </div>

            <span className="best-label">Administrator</span>
          </div>

          <p className="muted">
            Manage and review registered SmartCart accounts.
          </p>

          <button
            onClick={() => loadAdminUsers(token)}
            disabled={adminLoading}
          >
            {adminLoading ? "Loading..." : "Refresh user list"}
          </button>

          <h3>Total registered accounts: {users.length}</h3>

          {adminLoading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p className="muted">No user records found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "16px"
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px" }}>ID</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Role</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ padding: "12px" }}>{user.id}</td>
                      <td style={{ padding: "12px" }}>{user.name}</td>
                      <td style={{ padding: "12px" }}>{user.email}</td>
                      <td style={{ padding: "12px" }}>
                        {user.is_admin ? "Admin" : "Customer"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {user.is_active ? "Active" : "Disabled"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <footer>
        SmartCart AI · Hackathon MVP · Demo catalogue only
      </footer>
    </main>
  );
}
