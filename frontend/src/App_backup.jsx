import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [query, setQuery] = useState("Sony WH-1000XM5");
  const [offers, setOffers] = useState([]);
  const [notice, setNotice] = useState("Search the demo catalogue to compare offers.");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState(localStorage.getItem("smartcart_token") || "");
  const [authMode, setAuthMode] = useState("login");

  async function search(event) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch(`${API}/api/products/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Search failed");
      setOffers(data.offers || []);
     setNotice(data.count === 0
  ? `No matching demo products found for "${query}". Try Apple AirPods Pro 2 or Sony WH-1000XM5.`
  : data.notice || "");
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
    const body = authMode === "login"
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(`${API}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Authentication failed");
      localStorage.setItem("smartcart_token", data.access_token);
      setToken(data.access_token);
      setNotice(`Welcome, ${data.user.name}. You are signed in.`);
    } catch (error) {
      setNotice(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("smartcart_token");
    setToken("");
    setNotice("You have signed out.");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">SmartCart <span>AI</span></a>
        <div className="account">
          {token
            ? <button className="quiet" onClick={logout}>Sign out</button>
            : <span className="muted">Smart shopping, made simple</span>}
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">SMART SHOPPING ASSISTANT</p>
        <h1>Find the right product.<br /><span>Pay the right price.</span></h1>
        <p className="intro">Compare offers in one place and see the lowest listed demo price, including known shipping.</p>
        <form className="search" onSubmit={search}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a product..." aria-label="Product search" />
          <button disabled={loading}>{loading ? "Searching..." : "Compare prices"}</button>
        </form>
        {notice && <p className="notice">{notice}</p>}
      </section>

      {offers.length > 0 && (
        <section className="results">
          <div className="section-heading">
            <div><p className="eyebrow">COMPARISON</p><h2>Available offers</h2></div>
            <span className="muted">{offers.length} demo offers</span>
          </div>
          <div className="offer-list">
            {offers.map((offer, index) => (
              <article className={`offer ${index === 0 ? "best" : ""}`} key={offer.id}>
                <div><p className="retailer">{offer.retailer} {index === 0 && <span className="best-label">Lowest total</span>}</p><h3>{offer.product}</h3></div>
                <div className="price">
                  <strong>₹{(offer.price + offer.shipping).toLocaleString("en-IN")}</strong>
                  <small>Item ₹{offer.price.toLocaleString("en-IN")} · Shipping ₹{offer.shipping.toLocaleString("en-IN")}</small>
                  <a href={offer.url} target="_blank" rel="noreferrer">Demo link ↗</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="auth-panel">
        <div>
          <p className="eyebrow">YOUR ACCOUNT</p>
          <h2>{token ? "You're signed in" : authMode === "login" ? "Welcome back" : "Create an account"}</h2>
          <p className="muted">Create a customer account or sign in to your existing account.</p>
        </div>
        {!token && (
          <form className="auth-form" onSubmit={authenticate}>
            {authMode === "register" && <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" minLength="2" required />}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (minimum 8 characters)" minLength="8" required />
            <button>{authMode === "login" ? "Sign in" : "Register"}</button>
            <button type="button" className="quiet" onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
              {authMode === "login" ? "Create a new account" : "I already have an account"}
            </button>
          </form>
        )}
      </section>

      <footer>SmartCart AI · Hackathon MVP · Demo catalogue only</footer>
    </main>
  );
}
