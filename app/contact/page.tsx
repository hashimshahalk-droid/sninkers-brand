import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="info-page">
      <header className="info-nav"><Link href="/" className="brand">SNICKERS® <span>Official Store</span></Link><nav><Link href="/products">Shop</Link><Link href="/about">About</Link><Link href="/cart">Cart</Link></nav></header>
      <section className="info-hero"><p className="eyebrow">Customer care</p><h1>We’re here to help.</h1><p>Need help with an order, shipping, or choosing a treat? Send our team a message on WhatsApp and we’ll get back to you.</p><a className="info-button" href="https://wa.me/?text=Hi%21%20I%20need%20help%20with%20my%20SNICKERS%20Store%20order." target="_blank" rel="noreferrer">Message us on WhatsApp</a></section>
      <section className="info-copy"><h2>What can we help with?</h2><ul><li>Order status and delivery questions</li><li>Product and ingredient questions</li><li>Returns or replacement requests</li></ul><p>For an order update, include your order number in your message.</p><Link href="/products">Browse the collection →</Link></section>
      <footer className="info-footer">© 2026 SNICKERS® Store <Link href="/">Back to home</Link></footer>
    </main>
  );
}
