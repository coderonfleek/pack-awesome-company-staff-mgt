"use strict"; // necessary for es6 output in node

import {
  browser,
  element,
  by,
  ElementFinder,
  ElementArrayFinder
} from "protractor";
import { promise } from "selenium-webdriver";

const expectedH1 = "Tour of Staff";
const expectedTitle = `${expectedH1}`;
const targetStaff = { id: 15, name: "Magneta" };
const targetStaffDashboardIndex = 3;
const nameSuffix = "X";
const newStaffName = targetStaff.name + nameSuffix;

class Staff {
  id: number;
  name: string;

  // Factory methods

  // Staff from string formatted as '<id> <name>'.
  static fromString(s: string): Staff {
    return {
      id: +s.substr(0, s.indexOf(" ")),
      name: s.substr(s.indexOf(" ") + 1)
    };
  }

  // Staff from staff list <li> element.
  static async fromLi(li: ElementFinder): Promise<Staff> {
    let stringsFromA = await li.all(by.css("a")).getText();
    let strings = stringsFromA[0].split(" ");
    return { id: +strings[0], name: strings[1] };
  }

  // Staff id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Staff> {
    // Get staff id from the first <div>
    let _id = await detail
      .all(by.css("div"))
      .first()
      .getText();
    // Get name from the h2
    let _name = await detail.element(by.css("h2")).getText();
    return {
      id: +_id.substr(_id.indexOf(" ") + 1),
      name: _name.substr(0, _name.lastIndexOf(" "))
    };
  }
}

describe("Tutorial part 6", () => {
  beforeAll(() => browser.get(""));

  function getPageElts() {
    let navElts = element.all(by.css("app-root nav a"));

    return {
      navElts: navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css("app-root app-dashboard")),
      topStaff: element.all(by.css("app-root app-dashboard > div h4")),

      appStaffHref: navElts.get(1),
      appStaff: element(by.css("app-root app-staff")),
      allStaff: element.all(by.css("app-root app-staff li")),
      selectedStaffSubview: element(
        by.css("app-root app-staff > div:last-child")
      ),

      staffDetail: element(by.css("app-root app-staff-detail > div")),

      searchBox: element(by.css("#search-box")),
      searchResults: element.all(by.css(".search-result li"))
    };
  }

  describe("Initial page", () => {
    it(`has title '${expectedTitle}'`, () => {
      expect(browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, () => {
      expectHeading(1, expectedH1);
    });

    const expectedViewNames = ["Dashboard", "Staff"];
    it(`has views ${expectedViewNames}`, () => {
      let viewNames = getPageElts().navElts.map((el: ElementFinder) =>
        el.getText()
      );
      expect(viewNames).toEqual(expectedViewNames);
    });

    it("has dashboard as the active view", () => {
      let page = getPageElts();
      expect(page.appDashboard.isPresent()).toBeTruthy();
    });
  });

  describe("Dashboard tests", () => {
    beforeAll(() => browser.get(""));

    it("has top staff", () => {
      let page = getPageElts();
      expect(page.topStaff.count()).toEqual(4);
    });

    it(
      `selects and routes to ${targetStaff.name} details`,
      dashboardSelectTargetStaff
    );

    it(
      `updates staff name (${newStaffName}) in details view`,
      updateStaffNameInDetailView
    );

    it(`cancels and shows ${targetStaff.name} in Dashboard`, () => {
      element(by.buttonText("go back")).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetStaffElt = getPageElts().topStaff.get(
        targetStaffDashboardIndex
      );
      expect(targetStaffElt.getText()).toEqual(targetStaff.name);
    });

    it(
      `selects and routes to ${targetStaff.name} details`,
      dashboardSelectTargetStaff
    );

    it(
      `updates staff name (${newStaffName}) in details view`,
      updateStaffNameInDetailView
    );

    it(`saves and shows ${newStaffName} in Dashboard`, () => {
      element(by.buttonText("save")).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetStaffElt = getPageElts().topStaff.get(
        targetStaffDashboardIndex
      );
      expect(targetStaffElt.getText()).toEqual(newStaffName);
    });
  });

  describe("Staff tests", () => {
    beforeAll(() => browser.get(""));

    it("can switch to Staff view", () => {
      getPageElts().appStaffHref.click();
      let page = getPageElts();
      expect(page.appStaff.isPresent()).toBeTruthy();
      expect(page.allStaff.count()).toEqual(10, "number of staff");
    });

    it("can route to staff details", async () => {
      getStaffLiEltById(targetStaff.id).click();

      let page = getPageElts();
      expect(page.staffDetail.isPresent()).toBeTruthy("shows staff detail");
      let staff = await Staff.fromDetail(page.staffDetail);
      expect(staff.id).toEqual(targetStaff.id);
      expect(staff.name).toEqual(targetStaff.name.toUpperCase());
    });

    it(
      `updates staff name (${newStaffName}) in details view`,
      updateStaffNameInDetailView
    );

    it(`shows ${newStaffName} in Staff list`, () => {
      element(by.buttonText("save")).click();
      browser.waitForAngular();
      let expectedText = `${targetStaff.id} ${newStaffName}`;
      expect(getStaffAEltById(targetStaff.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newStaffName} from Staff list`, async () => {
      const staffBefore = await toStaffArray(getPageElts().allStaff);
      const li = getStaffLiEltById(targetStaff.id);
      li.element(by.buttonText("x")).click();

      const page = getPageElts();
      expect(page.appStaff.isPresent()).toBeTruthy();
      expect(page.allStaff.count()).toEqual(9, "number of staff");
      const staffAfter = await toStaffArray(page.allStaff);
      // console.log(await Staff.fromLi(page.allStaff[0]));
      const expectedStaff = staffBefore.filter(h => h.name !== newStaffName);
      expect(staffAfter).toEqual(expectedStaff);
      // expect(page.selectedStaffSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetStaff.name}`, async () => {
      const newStaffName = "Alice";
      const staffBefore = await toStaffArray(getPageElts().allStaff);
      const numStaff = staffBefore.length;

      element(by.css("input")).sendKeys(newStaffName);
      element(by.buttonText("add")).click();

      let page = getPageElts();
      let staffAfter = await toStaffArray(page.allStaff);
      expect(staffAfter.length).toEqual(numStaff + 1, "number of staff");

      expect(staffAfter.slice(0, numStaff)).toEqual(
        staffBefore,
        "Old staff are still there"
      );

      const maxId = staffBefore[staffBefore.length - 1].id;
      expect(staffAfter[numStaff]).toEqual({
        id: maxId + 1,
        name: newStaffName
      });
    });

    it("displays correctly styled buttons", async () => {
      element.all(by.buttonText("x")).then(buttons => {
        for (const button of buttons) {
          // Inherited styles from styles.css
          expect(button.getCssValue("font-family")).toBe("Arial");
          expect(button.getCssValue("border")).toContain("none");
          expect(button.getCssValue("padding")).toBe("5px 10px");
          expect(button.getCssValue("border-radius")).toBe("4px");
          // Styles defined in staff.component.css
          expect(button.getCssValue("left")).toBe("194px");
          expect(button.getCssValue("top")).toBe("-32px");
        }
      });

      const addButton = element(by.buttonText("add"));
      // Inherited styles from styles.css
      expect(addButton.getCssValue("font-family")).toBe("Arial");
      expect(addButton.getCssValue("border")).toContain("none");
      expect(addButton.getCssValue("padding")).toBe("5px 10px");
      expect(addButton.getCssValue("border-radius")).toBe("4px");
    });
  });

  describe("Progressive staff search", () => {
    beforeAll(() => browser.get(""));

    it(`searches for 'Ma'`, async () => {
      getPageElts().searchBox.sendKeys("Ma");
      browser.sleep(1000);

      expect(getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      getPageElts().searchBox.sendKeys("g");
      browser.sleep(1000);
      expect(getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetStaff.name}`, async () => {
      getPageElts().searchBox.sendKeys("n");
      browser.sleep(1000);
      let page = getPageElts();
      expect(page.searchResults.count()).toBe(1);
      let staff = page.searchResults.get(0);
      expect(staff.getText()).toEqual(targetStaff.name);
    });

    it(`navigates to ${targetStaff.name} details view`, async () => {
      let staff = getPageElts().searchResults.get(0);
      expect(staff.getText()).toEqual(targetStaff.name);
      staff.click();

      let page = getPageElts();
      expect(page.staffDetail.isPresent()).toBeTruthy("shows staff detail");
      let staff2 = await Staff.fromDetail(page.staffDetail);
      expect(staff2.id).toEqual(targetStaff.id);
      expect(staff2.name).toEqual(targetStaff.name.toUpperCase());
    });
  });

  async function dashboardSelectTargetStaff() {
    let targetStaffElt = getPageElts().topStaff.get(targetStaffDashboardIndex);
    expect(targetStaffElt.getText()).toEqual(targetStaff.name);
    targetStaffElt.click();
    browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    let page = getPageElts();
    expect(page.staffDetail.isPresent()).toBeTruthy("shows staff detail");
    let staff = await Staff.fromDetail(page.staffDetail);
    expect(staff.id).toEqual(targetStaff.id);
    expect(staff.name).toEqual(targetStaff.name.toUpperCase());
  }

  async function updateStaffNameInDetailView() {
    // Assumes that the current view is the staff details view.
    addToStaffName(nameSuffix);

    let page = getPageElts();
    let staff = await Staff.fromDetail(page.staffDetail);
    expect(staff.id).toEqual(targetStaff.id);
    expect(staff.name).toEqual(newStaffName.toUpperCase());
  }
});

function addToStaffName(text: string): promise.Promise<void> {
  let input = element(by.css("input"));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
  let hTag = `h${hLevel}`;
  let hText = element(by.css(hTag)).getText();
  expect(hText).toEqual(expectedText, hTag);
}

function getStaffAEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText("li span.badge", id.toString()));
  return spanForId.element(by.xpath(".."));
}

function getStaffLiEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText("li span.badge", id.toString()));
  return spanForId.element(by.xpath("../.."));
}

async function toStaffArray(allStaff: ElementArrayFinder): Promise<Staff[]> {
  let promisedStaff = await allStaff.map(Staff.fromLi);
  // The cast is necessary to get around issuing with the signature of Promise.all()
  return <Promise<any>>Promise.all(promisedStaff);
}
