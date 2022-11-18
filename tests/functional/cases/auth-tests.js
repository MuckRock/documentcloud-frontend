/* global process */

async function signInTest({ page, t }) {
  if (!process.env) {
    throw new Error(
      "TEST_USER and TEST_PASS need to be set as environment variables and dotenv needs to be initialized before calling signInTest.",
    );
  }
  try {
    await page.getByText("Sign in").click({ strict: false });
    await page.locator("#id_login").fill(process.env.TEST_USER);
    await page.locator("#id_password").fill(process.env.TEST_PASS);
    var form = await page.locator("#login_form");
    var logInButton = await form.getByText("Log in");
    await logInButton.click();
    t.pass("Signed in");
  } catch (error) {
    t.fail(`Error while signing in: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}

module.exports = { signInTest };
