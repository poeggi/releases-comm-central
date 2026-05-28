/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/**
 * Tests that gloda.show_as_list_by_default controls whether a global search
 * opens the faceted search view or a mail3PaneTab list view.
 */

function performGlobalSearch(term) {
  const searchInput = document.querySelector(
    "#unifiedToolbarContent .search-bar global-search-bar"
  );
  searchInput.reset();
  searchInput.focus();
  EventUtils.sendString(term, searchInput.documentGlobal);
  EventUtils.synthesizeKey("KEY_Enter", {}, searchInput.documentGlobal);
}

add_task(async function testShowAsListSettingFalse() {
  await SpecialPowers.pushPrefEnv({
    set: [["gloda.show_as_list_by_default", false]],
  });
  const tabmail = document.getElementById("tabmail");
  performGlobalSearch("testfacet");
  await BrowserTestUtils.waitForCondition(
    () =>
      tabmail.tabInfo.length === 2 &&
      tabmail.tabInfo[1].mode.name === "glodaFacet",
    "glodaFacet tab should open when gloda.show_as_list_by_default is false"
  );
  Assert.equal(
    tabmail.tabInfo[1].mode.name,
    "glodaFacet",
    "setting false opens faceted search tab"
  );
  while (tabmail.tabInfo.length > 1) {
    tabmail.closeTab(1);
  }
  await SpecialPowers.popPrefEnv();
});

add_task(async function testShowAsListSettingTrue() {
  await SpecialPowers.pushPrefEnv({
    set: [["gloda.show_as_list_by_default", true]],
  });
  const tabmail = document.getElementById("tabmail");
  performGlobalSearch("testlistview");
  await BrowserTestUtils.waitForCondition(
    () =>
      tabmail.tabInfo.length === 2 &&
      tabmail.tabInfo[1].mode.name === "mail3PaneTab",
    "mail3PaneTab should open when gloda.show_as_list_by_default is true"
  );
  await BrowserTestUtils.waitForCondition(
    () =>
      tabmail.tabInfo[1]?.chromeBrowser?.contentWindow?.gViewWrapper
        ?.isSynthetic,
    "tab should contain a synthetic Gloda view"
  );
  Assert.equal(
    tabmail.tabInfo[1].mode.name,
    "mail3PaneTab",
    "setting true opens thread list tab"
  );
  Assert.ok(
    tabmail.tabInfo[1].chromeBrowser.contentWindow.gViewWrapper.isSynthetic,
    "tab has a synthetic Gloda view, not a plain folder tab"
  );
  while (tabmail.tabInfo.length > 1) {
    tabmail.closeTab(1);
  }
  await SpecialPowers.popPrefEnv();
});

registerCleanupFunction(function () {
  const tabmail = document.getElementById("tabmail");
  while (tabmail.tabInfo.length > 1) {
    tabmail.closeTab(1);
  }
});
