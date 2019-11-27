it('visits log in', () => {
  // TODO: put tests in, figure out auth
  cy.visit('/');
  cy.get('header > .headercontents > .signupcontainer > .signin > a').click();
});
