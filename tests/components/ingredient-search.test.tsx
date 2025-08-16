import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../utils/test-utils";
import userEvent from "@testing-library/user-event";
import { mockIngredientsApi } from "../utils/api-test-utils";

// Mock component for testing search functionality
const IngredientSearch = ({
  onResults,
}: {
  onResults: (results: any[]) => void;
}) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/ingredients?search=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setResults(data.data || []);
      onResults(data.data || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search ingredients..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          data-testid="search-input"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          data-testid="search-button"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      <div data-testid="results-container">
        {results.length > 0 && (
          <ul>
            {results.map((ingredient: any) => (
              <li
                key={ingredient.id}
                data-testid={`ingredient-${ingredient.id}`}
              >
                <span>{ingredient.name_vi}</span>
                {ingredient.name_en && <span> ({ingredient.name_en})</span>}
                <span> - {ingredient.category}</span>
              </li>
            ))}
          </ul>
        )}
        {results.length === 0 && query && !isLoading && (
          <p data-testid="no-results">No ingredients found</p>
        )}
      </div>
    </div>
  );
};

describe("IngredientSearch Component", () => {
  const mockOnResults = vi.fn();

  beforeEach(() => {
    mockOnResults.mockClear();
  });

  describe("Rendering", () => {
    it("should render search input and button", () => {
      render(<IngredientSearch onResults={mockOnResults} />);

      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(screen.getByTestId("search-button")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Search ingredients..."),
      ).toBeInTheDocument();
    });

    it("should render with empty results initially", () => {
      render(<IngredientSearch onResults={mockOnResults} />);

      const resultsContainer = screen.getByTestId("results-container");
      expect(resultsContainer).toBeEmptyDOMElement();
    });
  });

  describe("Search Functionality", () => {
    it("should perform search when search button is clicked", async () => {
      const mockResults = [
        { id: "1", name_vi: "Thịt bò", name_en: "Beef", category: "meat" },
        {
          id: "2",
          name_vi: "Cà chua",
          name_en: "Tomato",
          category: "vegetables",
        },
      ];

      mockIngredientsApi.getAll(mockResults);

      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      const searchInput = screen.getByTestId("search-input");
      const searchButton = screen.getByTestId("search-button");

      await user.type(searchInput, "thịt");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId("ingredient-1")).toBeInTheDocument();
        expect(screen.getByTestId("ingredient-2")).toBeInTheDocument();
      });

      expect(mockOnResults).toHaveBeenCalledWith(mockResults);
    });

    it("should perform search when Enter key is pressed", async () => {
      const mockResults = [
        { id: "1", name_vi: "Phở bò", name_en: "Beef Pho", category: "soup" },
      ];

      mockIngredientsApi.getAll(mockResults);

      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      const searchInput = screen.getByTestId("search-input");

      await user.type(searchInput, "phở{enter}");

      await waitFor(() => {
        expect(screen.getByTestId("ingredient-1")).toBeInTheDocument();
      });

      expect(mockOnResults).toHaveBeenCalledWith(mockResults);
    });

    it("should show loading state during search", async () => {
      // Mock a delayed response
      const mockResults = [{ id: "1", name_vi: "Test", category: "test" }];
      mockIngredientsApi.getAll(mockResults);

      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      const searchInput = screen.getByTestId("search-input");
      const searchButton = screen.getByTestId("search-button");

      await user.type(searchInput, "test");
      await user.click(searchButton);

      // Should show loading state briefly
      expect(searchButton).toHaveTextContent("Searching...");
      expect(searchButton).toBeDisabled();

      await waitFor(() => {
        expect(searchButton).toHaveTextContent("Search");
        expect(searchButton).not.toBeDisabled();
      });
    });

    it("should not search when query is empty", async () => {
      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      const searchButton = screen.getByTestId("search-button");

      await user.click(searchButton);

      expect(mockOnResults).not.toHaveBeenCalled();
    });

    it("should not search when query is only whitespace", async () => {
      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      const searchInput = screen.getByTestId("search-input");
      const searchButton = screen.getByTestId("search-button");

      await user.type(searchInput, "   ");
      await user.click(searchButton);

      expect(mockOnResults).not.toHaveBeenCalled();
    });
  });

  describe("Results Display", () => {
    it("should display search results correctly", async () => {
      const mockResults = [
        {
          id: "1",
          name_vi: "Thịt bò",
          name_en: "Beef",
          category: "meat",
        },
        {
          id: "2",
          name_vi: "Cà chua",
          name_en: "Tomato",
          category: "vegetables",
        },
      ];

      mockIngredientsApi.getAll(mockResults);

      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      await user.type(screen.getByTestId("search-input"), "ingredient");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        const result1 = screen.getByTestId("ingredient-1");
        const result2 = screen.getByTestId("ingredient-2");

        expect(result1).toHaveTextContent("Thịt bò (Beef) - meat");
        expect(result2).toHaveTextContent("Cà chua (Tomato) - vegetables");
      });
    });

    it("should display results without English name when not available", async () => {
      const mockResults = [
        {
          id: "1",
          name_vi: "Rau răm",
          name_en: null,
          category: "vegetables",
        },
      ];

      mockIngredientsApi.getAll(mockResults);

      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      await user.type(screen.getByTestId("search-input"), "rau");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        const result = screen.getByTestId("ingredient-1");
        expect(result).toHaveTextContent("Rau răm - vegetables");
        expect(result).not.toHaveTextContent("(");
      });
    });

    it("should show no results message when search returns empty", async () => {
      mockIngredientsApi.getAll([]);

      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      await user.type(screen.getByTestId("search-input"), "nonexistent");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByTestId("no-results")).toBeInTheDocument();
        expect(screen.getByTestId("no-results")).toHaveTextContent(
          "No ingredients found",
        );
      });
    });

    it("should not show no results message when no search has been performed", () => {
      render(<IngredientSearch onResults={mockOnResults} />);

      expect(screen.queryByTestId("no-results")).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      mockIngredientsApi.error(500, "Internal Server Error");

      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      await user.type(screen.getByTestId("search-input"), "error");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByTestId("no-results")).toBeInTheDocument();
      });

      expect(mockOnResults).toHaveBeenCalledWith([]);
    });
  });

  describe("User Interaction", () => {
    it("should update input value when user types", async () => {
      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      const searchInput = screen.getByTestId("search-input");

      await user.type(searchInput, "Vietnamese ingredients");

      expect(searchInput.value).toBe("Vietnamese ingredients");
    });

    it("should clear results when performing new search", async () => {
      const firstResults = [{ id: "1", name_vi: "First", category: "test" }];
      const secondResults = [{ id: "2", name_vi: "Second", category: "test" }];

      const user = userEvent.setup();
      render(<IngredientSearch onResults={mockOnResults} />);

      // First search
      mockIngredientsApi.getAll(firstResults);
      await user.type(screen.getByTestId("search-input"), "first");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByTestId("ingredient-1")).toBeInTheDocument();
      });

      // Second search
      mockIngredientsApi.getAll(secondResults);
      await user.clear(screen.getByTestId("search-input"));
      await user.type(screen.getByTestId("search-input"), "second");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByTestId("ingredient-2")).toBeInTheDocument();
        expect(screen.queryByTestId("ingredient-1")).not.toBeInTheDocument();
      });
    });
  });
});
