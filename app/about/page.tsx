import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="info-page">
      <header className="info-nav"><Link href="/" className="brand">SNICKERS® <span>Official Store</span></Link><nav><Link href="/products">Shop</Link><Link href="/contact">Contact</Link><Link href="/cart">Cart</Link></nav></header>
      <section className="info-hero"><p className="eyebrow">A little more about us</p><h1>Hungry for a story?</h1><p>It starts with the classic combination of roasted peanuts, caramel, nougat, and milk chocolate: a satisfying treat made for sharing (or keeping all to yourself).</p><Link className="info-button" href="/products">Explore the collection</Link></section>
      <section className="info-copy"><h2>Made for your everyday cravings</h2><p>From a quick afternoon pick-me-up to a treat for the whole crew, find your favorite SNICKERS® bars and bundles in our collection.</p><p>Questions about an order or a product? Our team is happy to help.</p><Link href="/contact">Get in touch →</Link></section>
      <footer className="info-footer">© 2026 SNICKERS® Store <Link href="/">Back to home</Link></footer>
    </main>
  );
}
