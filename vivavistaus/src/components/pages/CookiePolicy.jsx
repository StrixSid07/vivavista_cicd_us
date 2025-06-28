import React from "react";

const CookiePolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        Cookie Policy – Viva Vista Vacations
      </h1>

      <section className="mb-6">
        <p className="mb-4">
          Viva Vista Vacations uses small text files called cookies, which are
          stored on your device's hard drive. These cookies are placed by our
          web server to identify the device used to visit the Viva Vista
          Vacations website. The stored cookies help capture useful features
          based on your recent searches and preferences, allowing us to
          personalize and enhance your future browsing experience.
        </p>
        <p>
          By continuing to browse our website or using our app, you agree to our
          use of cookies.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Why We Use Cookies</h2>
        <ul className="list-disc ml-5 mb-4">
          <li>
            <strong>Website Performance & Analytics:</strong> To track the
            number of unique visitors and requests our website receives from
            various locations. This helps us optimize website capacity, speed,
            and functionality.
          </li>
          <li>
            <strong>Seamless Browsing Experience:</strong> To maintain logged-in
            sessions, ensuring a smooth and uninterrupted experience while
            navigating our website.
          </li>
          <li>
            <strong>Personalized Content:</strong> When you visit our booking
            pages, cookies help us customize layouts and content based on your
            stored preferences.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
        <p className="mb-4">
          Cookies remain unique to each browser, meaning if you access our
          website from multiple browsers or devices, the data is collected and
          stored separately. Viva Vista Vacations uses session cookies to track
          your booking process and retain information as you move through
          different stages. These cookies enable our search panel to remember
          details you have entered, making it easier for you to return and
          continue browsing without re-entering information.
        </p>
        <p className="mb-4">
          For instance, if you select a holiday but leave the website and return
          later, our cookies ensure your selected holiday is still available for
          review. Similarly, if you save deals in our online scrapbook, they
          will be waiting for you when you revisit.
        </p>
        <p className="mb-4">
          If you frequently visit our website, persistent cookies can enhance
          your experience by remembering your preferences. You can enable these
          cookies through your browser settings.
        </p>
        <p className="mb-4">
          Whenever you visit our website, cookies may contain:
        </p>
        <ul className="list-disc ml-5 mb-4">
          <li>Cookie lifetime and value</li>
          <li>Domain name</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
        <ol className="list-decimal ml-5 mb-4">
          <li>
            <strong>Technical Cookies:</strong> Essential for the proper
            functioning of our website. They provide users with requested
            content, manage traffic, maintain session security, and allow
            content sharing over social networks.
          </li>
          <li>
            <strong>Performance Cookies:</strong> Monitor user behavior on our
            website, gathering data on frequently visited pages and potential
            malfunctions. They help improve website performance by tracking
            statistics like page visit counts, technologies used, and page load
            times.
          </li>
          <li>
            <strong>Functionality Cookies:</strong> Recognize you when you
            return to our website or app. They enable us to personalize content,
            remember your preferences (such as language or recent searches), and
            provide a more tailored experience.
          </li>
          <li>
            <strong>Third-Party Cookies:</strong> Used by third-party tools such
            as Facebook Pixel Code to enhance your experience. These cookies
            check if you are logged into social media platforms and allow
            functionalities such as liking or sharing content.
          </li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
        <p className="mb-4">
          You can manage or delete cookies based on your preferences. Most
          modern browsers allow you to adjust cookie settings through their
          settings or preferences menu. If you wish to disable cookies, you can
          follow the step-by-step guides below for specific browsers:
        </p>
        <ul className="list-disc ml-5 mb-4">
          <li>
            <strong>Google Chrome:</strong>{" "}
            <a
              href="https://support.google.com/chrome/answer/95647?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-deep-orange-600 underline"
            >
              https://support.google.com/chrome/answer/95647?hl=en
            </a>
          </li>
          <li>
            <strong>Mozilla Firefox:</strong>{" "}
            <a
              href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US"
              target="_blank"
              rel="noopener noreferrer"
              className="text-deep-orange-600 underline"
            >
              https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop
            </a>
          </li>
          <li>
            <strong>Microsoft Edge:</strong>{" "}
            <a
              href="https://support.microsoft.com/en-us/microsoft-edge/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-deep-orange-600 underline"
            >
              https://support.microsoft.com/en-us/microsoft-edge
            </a>
          </li>
          <li>
            <strong>Safari:</strong>{" "}
            <a
              href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-deep-orange-600 underline"
            >
              https://support.apple.com/en-gb/guide/safari/sfri11471/mac
            </a>
          </li>
        </ul>
        <p className="mb-4">
          Please note that disabling cookies may limit access to certain website
          features.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">If You Have Questions</h2>
        <p>
          If you have any questions or comments regarding our Cookie Policy,
          feel free to reach us at{" "}
          <a
            href="mailto:admin@vivavistavacations.ca"
            className="text-deep-orange-600 underline"
          >
            admin@vivavistavacations.ca
          </a>
          .
        </p>
      </section>
    </div>
  );
};

export default CookiePolicy;
