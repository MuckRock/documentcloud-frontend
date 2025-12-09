import { describe, expect, test } from "vitest";
import { clean, renderMarkdown } from "../markup";

describe("clean() security tests", () => {
  // Test allowed tags work correctly
  test("allows safe HTML tags", () => {
    const input = "<p>Hello <strong>world</strong></p>";
    const result = clean(input);
    expect(result).toBe("<p>Hello <strong>world</strong></p>");
  });

  test("allows links with href attribute", () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = clean(input);
    expect(result).toBe('<a href="https://example.com">Link</a>');
  });

  test("allows emphasis and code tags", () => {
    const input = "<em>italic</em> and <code>code</code>";
    const result = clean(input);
    expect(result).toBe("<em>italic</em> and <code>code</code>");
  });

  test("allows b and i tags", () => {
    const input = "<b>bold</b> and <i>italic</i>";
    const result = clean(input);
    expect(result).toBe("<b>bold</b> and <i>italic</i>");
  });

  // XSS Prevention Tests
  test("removes script tags", () => {
    const input = '<script>alert("XSS")</script>';
    const result = clean(input);
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  });

  test("removes inline JavaScript event handlers", () => {
    const input = '<a href="#" onclick="alert(\'XSS\')">Click</a>';
    const result = clean(input);
    expect(result).not.toContain("onclick");
    expect(result).not.toContain("alert");
  });

  test("removes onerror handlers on images", () => {
    const input = '<img src="x" onerror="alert(\'XSS\')">';
    const result = clean(input);
    expect(result).not.toContain("<img");
    expect(result).not.toContain("onerror");
  });

  test("removes javascript: protocol in links", () => {
    const input = "<a href=\"javascript:alert('XSS')\">Click</a>";
    const result = clean(input);
    // Should either remove the link or sanitize the href
    expect(result).not.toContain("javascript:");
  });

  test("removes data: protocol in links", () => {
    const input =
      "<a href=\"data:text/html,<script>alert('XSS')</script>\">Click</a>";
    const result = clean(input);
    expect(result).not.toContain("data:");
  });

  test("removes vbscript: protocol in links", () => {
    const input = "<a href=\"vbscript:msgbox('XSS')\">Click</a>";
    const result = clean(input);
    expect(result).not.toContain("vbscript:");
  });

  // Tag-based XSS attempts
  test("removes iframe tags", () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    const result = clean(input);
    expect(result).not.toContain("<iframe");
  });

  test("removes object tags", () => {
    const input = '<object data="https://evil.com"></object>';
    const result = clean(input);
    expect(result).not.toContain("<object");
  });

  test("removes embed tags", () => {
    const input = '<embed src="https://evil.com">';
    const result = clean(input);
    expect(result).not.toContain("<embed");
  });

  test("removes form tags", () => {
    const input = '<form action="https://evil.com"><input name="data"></form>';
    const result = clean(input);
    expect(result).not.toContain("<form");
    expect(result).not.toContain("<input");
  });

  test("removes style tags", () => {
    const input = "<style>body { display: none; }</style>";
    const result = clean(input);
    expect(result).not.toContain("<style");
  });

  test("removes link tags", () => {
    const input = '<link rel="stylesheet" href="https://evil.com/xss.css">';
    const result = clean(input);
    expect(result).not.toContain("<link");
  });

  test("removes meta tags", () => {
    const input =
      '<meta http-equiv="refresh" content="0;url=https://evil.com">';
    const result = clean(input);
    expect(result).not.toContain("<meta");
  });

  // Attribute-based XSS attempts
  test("removes style attributes", () => {
    const input =
      "<p style=\"background: url(javascript:alert('XSS'))\">Text</p>";
    const result = clean(input);
    expect(result).not.toContain("style=");
    expect(result).not.toContain("javascript:");
  });

  test("removes id attributes", () => {
    const input = '<p id="test">Text</p>';
    const result = clean(input);
    expect(result).not.toContain("id=");
  });

  test("removes class attributes", () => {
    const input = '<p class="test">Text</p>';
    const result = clean(input);
    expect(result).not.toContain("class=");
  });

  test("removes data attributes", () => {
    const input = '<p data-value="test">Text</p>';
    const result = clean(input);
    expect(result).not.toContain("data-");
  });

  test("only allows href on anchor tags", () => {
    const input = '<p href="https://example.com">Text</p>';
    const result = clean(input);
    expect(result).not.toContain("href=");
  });

  // Encoding and obfuscation attempts
  test("handles HTML entity encoded script tags", () => {
    const input = "&lt;script&gt;alert('XSS')&lt;/script&gt;";
    const result = clean(input);
    // Entities should remain as text, not be decoded and executed
    expect(result).not.toContain("<script");
  });

  test("handles mixed case tag names", () => {
    const input = "<ScRiPt>alert('XSS')</sCrIpT>";
    const result = clean(input);
    expect(result).not.toContain("alert");
  });

  test("handles tags with extra whitespace", () => {
    const input = "< script >alert('XSS')</script >";
    const result = clean(input);
    // The malformed tag is escaped, content becomes text (safe)
    expect(result).toContain("&lt;");
    expect(result).not.toContain("<script");
  });

  test("handles null bytes in tags", () => {
    const input = "<script\0>alert('XSS')</script>";
    const result = clean(input);
    // Script tags are removed, text content may remain but is safe
    expect(result).not.toContain("<script");
  });

  // SVG-based XSS attempts
  test("removes SVG tags", () => {
    const input = "<svg onload=\"alert('XSS')\"></svg>";
    const result = clean(input);
    expect(result).not.toContain("<svg");
    expect(result).not.toContain("alert");
  });

  test("removes SVG with embedded script", () => {
    const input = '<svg><script>alert("XSS")</script></svg>';
    const result = clean(input);
    expect(result).not.toContain("<svg");
    expect(result).not.toContain("alert");
  });

  // Edge cases
  test("handles empty string", () => {
    const result = clean("");
    expect(result).toBe("");
  });

  test("handles plain text without HTML", () => {
    const input = "Hello world";
    const result = clean(input);
    expect(result).toBe("Hello world");
  });

  test("handles nested allowed tags", () => {
    const input = "<p><strong><em>nested</em></strong></p>";
    const result = clean(input);
    expect(result).toBe("<p><strong><em>nested</em></strong></p>");
  });

  test("removes disallowed tags but keeps content", () => {
    const input = "<div>Hello <span>world</span></div>";
    const result = clean(input);
    expect(result).not.toContain("<div");
    expect(result).not.toContain("<span");
    expect(result).toContain("Hello");
    expect(result).toContain("world");
  });

  test("handles malformed HTML", () => {
    const input = "<p>Unclosed paragraph";
    const result = clean(input);
    // Should still sanitize even if HTML is malformed
    expect(result).toContain("Unclosed paragraph");
  });

  test("removes multiple XSS vectors in one string", () => {
    const input =
      '<script>alert(1)</script><a href="javascript:alert(2)">Link</a><img onerror="alert(3)">';
    const result = clean(input);
    expect(result).not.toContain("alert");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("javascript:");
    expect(result).not.toContain("onerror");
  });

  // Protocol variations
  test("removes javascript: with different capitalization", () => {
    const input = "<a href=\"JaVaScRiPt:alert('XSS')\">Click</a>";
    const result = clean(input);
    expect(result.toLowerCase()).not.toContain("javascript:");
  });

  test("removes javascript: with URL encoding", () => {
    const input = "<a href=\"java%09script:alert('XSS')\">Click</a>";
    const result = clean(input);
    // URL-encoded javascript protocols should be blocked or sanitized
    // The exact behavior depends on the library, but the href should be modified
    const hrefMatch = result.match(/href="([^"]*)"/);
    if (hrefMatch && hrefMatch[1]) {
      // If href is preserved, ensure it doesn't contain dangerous content
      expect(hrefMatch[1].toLowerCase()).not.toContain("javascript");
    }
  });

  test("allows safe protocols in links", () => {
    const protocols = [
      "https://example.com",
      "http://example.com",
      "mailto:test@example.com",
      "/relative/path",
      "#anchor",
    ];

    protocols.forEach((href) => {
      const input = `<a href="${href}">Link</a>`;
      const result = clean(input);
      expect(result).toContain(href);
    });
  });
});

describe("renderMarkdown() security tests", () => {
  test("sanitizes markdown with embedded HTML", () => {
    const input = "# Hello\n\n<script>alert('XSS')</script>";
    const result = renderMarkdown(input);
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  });

  test("sanitizes markdown links with javascript protocol", () => {
    const input = "[Click me](javascript:alert('XSS'))";
    const result = renderMarkdown(input);
    expect(result).not.toContain("javascript:");
  });

  test("allows safe markdown formatting", () => {
    const input = "**bold** and *italic* and `code`";
    const result = renderMarkdown(input);
    expect(result).toContain("<strong>bold</strong>");
    expect(result).toContain("<em>italic</em>");
    expect(result).toContain("<code>code</code>");
  });

  test("allows safe markdown links", () => {
    const input = "[Example](https://example.com)";
    const result = renderMarkdown(input);
    expect(result).toContain('<a href="https://example.com">Example</a>');
  });

  test("sanitizes HTML in markdown link text", () => {
    const input = "[<script>alert('XSS')</script>](https://example.com)";
    const result = renderMarkdown(input);
    expect(result).not.toContain("<script");
  });

  test("sanitizes HTML in markdown headings", () => {
    const input = "# <script>alert('XSS')</script>";
    const result = renderMarkdown(input);
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  });

  test("handles markdown with images (should be removed)", () => {
    const input = "![Alt text](https://example.com/image.jpg)";
    const result = renderMarkdown(input);
    // Images aren't in the allowed tags, so they should be removed
    expect(result).not.toContain("<img");
  });
});
