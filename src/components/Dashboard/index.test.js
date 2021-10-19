import renderer from "react-test-renderer";
import Dashboard from "./index";
import { cleanup, render, screen } from "@testing-library/react";
import MockThemeProvider from "../../../__tests__/utils/mockTheme";

jest.mock("services/api/ProjectOwner");
import { GetUserInfoApi } from "services/api/ProjectOwner";

describe("Dashboard component", () => {
  test("Snapshot of Dashboard component is rendered", () => {
    const component = renderer.create(
      <MockThemeProvider>
        <Dashboard />
      </MockThemeProvider>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe("All dashboard components are rendered", () => {
    beforeEach(() => {
      // We mock the API call made by Dashboard
      GetUserInfoApi.mockImplementation(() => ({
        totalHasFundedMoney: 2000,
        holdFundAmt: 4000,
        totalAmountDataCollected: 600,
        balance: 8000,
      }));

      render(
        <MockThemeProvider>
          <Dashboard />
        </MockThemeProvider>
      );
    });

    afterEach(() => {
      cleanup();
    });

    test("Component for funds paid out is shown", () => {
      const paidFundsComponent = screen.getByText(/funds paid out/i);
      expect(paidFundsComponent).toBeInTheDocument();
    });

    test("Component for overall projects is shown", () => {
      const overallProjsComponent = screen.getByText(/total projects running/i);
      expect(overallProjsComponent).toBeInTheDocument();
    });

    test("Component for holding funds is shown", () => {
      const holdingFundsComponent = screen.getByText(/funds in holding/i);
      expect(holdingFundsComponent).toBeInTheDocument();
    });

    test("Component for total data collected is shown", () => {
      const dataCollectedComponent = screen.getByText(/data collected/i);
      expect(dataCollectedComponent).toBeInTheDocument();
    });
  });
});
