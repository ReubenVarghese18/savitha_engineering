import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import RFQFooter from '../components/RFQFooter';

// Orange markers = facts the business must supply before launch (see CEO_REVIEW_LIST.md).
function P({ children }) {
  return (
    <mark className="bg-[#FF4D00] text-black px-1 font-mono text-sm font-bold">
      [PLACEHOLDER: {children}]
    </mark>
  );
}

function LegalLayout({ title, description, children }) {
  return (
    <div className="no-roundness bg-[#0A0A0B] text-white min-h-screen flex flex-col antialiased selection:bg-[#FF4D00] selection:text-black stark-grid">
      <Helmet>
        <title>{`${title} | Savitha Engineering`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="flex-grow max-w-3xl w-full mx-auto px-6 py-20">
        <h1 className="text-5xl font-black uppercase leading-none mb-4">{title}</h1>
        <div className="space-y-8 text-gray-300 leading-relaxed">{children}</div>
      </main>
      <RFQFooter />
    </div>
  );
}

function Section({ heading, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-black uppercase text-white border-l-4 border-[#FF4D00] pl-3">{heading}</h2>
      {children}
    </section>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" description="How Savitha Engineering collects, uses and protects information submitted through this website.">
      <p>Last updated: <P>date</P></p>
      <Section heading="Who we are">
        <p><P>registered legal company name</P>, trading as Savitha Engineering, <P>registered address</P> (&ldquo;we&rdquo;, &ldquo;us&rdquo;).</p>
      </Section>
      <Section heading="What we collect">
        <p>When you request a quote or contact us we collect the details you enter: your name, company, email address and/or phone number, the products you select, your requirement details and, if provided, an equipment serial number.</p>
        <p>Like most websites, our servers and error-monitoring tools may record technical data such as your IP address, browser type and the pages that caused an error. This site may load fonts from Google Fonts, which means your browser contacts Google when a page loads. <P>list any analytics or tracking tools added before launch</P></p>
      </Section>
      <Section heading="How we use it">
        <p>We use this information to respond to your enquiry, prepare quotations, arrange production, delivery and after-sales service, and to keep the website secure and working.</p>
      </Section>
      <Section heading="Who we share it with">
        <p>We do not sell your information. We share it only with service providers that help us run the site and respond to you, such as our hosting provider (<P>hosting provider</P>) and email provider (<P>email provider</P>), or where the law requires it.</p>
      </Section>
      <Section heading="How long we keep it">
        <p>We keep enquiry and quotation records for <P>retention period</P>, then delete or anonymise them unless the law requires us to keep them longer.</p>
      </Section>
      <Section heading="Your choices">
        <p>You can ask us to access, correct or delete the personal information we hold about you by contacting us (details below).</p>
      </Section>
      <Section heading="Contact and grievances">
        <p>Email <a className="text-[#FF4D00] underline" href="mailto:info@savithaeng.com">info@savithaeng.com</a>. Grievance officer: <P>name, designation and email</P></p>
      </Section>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Use" description="Terms governing use of the Savitha Engineering website and the quotations issued through it.">
      <p>Last updated: <P>date</P></p>
      <Section heading="Using this website">
        <p>The information on this site is for general information about our products and services. By using it you agree to these terms. Please do not misuse the site or attempt to interfere with its operation.</p>
      </Section>
      <Section heading="Product information">
        <p>Specifications, images and descriptions are indicative and may change as designs are improved or customised. Final specifications are those confirmed in a written quotation or order acknowledgement.</p>
      </Section>
      <Section heading="Quotations and orders">
        <p>A quote request is not an order. A quotation is an offer valid for <P>validity period</P> and becomes binding only when confirmed in writing by both parties. Prices, lead times and payment terms are as stated in the quotation: <P>standard payment terms</P></p>
      </Section>
      <Section heading="Warranty and service">
        <p><P>warranty period and conditions</P></p>
      </Section>
      <Section heading="Liability">
        <p><P>limitation of liability wording, to be reviewed by a lawyer</P></p>
      </Section>
      <Section heading="Intellectual property">
        <p>Content on this website, including text, designs, drawings and images, belongs to Savitha Engineering or its licensors and may not be copied or reused without permission.</p>
      </Section>
      <Section heading="Governing law">
        <p>These terms are governed by the laws of India. Courts at <P>city</P> have exclusive jurisdiction.</p>
      </Section>
    </LegalLayout>
  );
}

export function ContactPage() {
  return (
    <LegalLayout title="Contact Us" description="Contact Savitha Engineering by phone, WhatsApp or email, or send a quote request through the form below.">
      <Section heading="Get in touch">
        <ul className="space-y-2 font-mono">
          <li>Phone: <a className="text-[#FF4D00] underline" href="tel:+918044464594">+91 8044464594</a></li>
          <li>WhatsApp: <a className="text-[#FF4D00] underline" href="https://wa.me/918044464594" target="_blank" rel="noopener noreferrer">+91 8044464594</a></li>
          <li>Email: <a className="text-[#FF4D00] underline" href="mailto:info@savithaeng.com">info@savithaeng.com</a></li>
          <li>Address: <P>registered office / works address</P></li>
          <li>Business hours: <P>days and hours</P></li>
        </ul>
      </Section>
      <p>To request a quotation, use the form below.</p>
    </LegalLayout>
  );
}
