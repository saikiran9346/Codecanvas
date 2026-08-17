const express = require("express");
const router = express.Router();
const Solution = require("../models/Solution");
const auth = require("../middleware/auth");
const axios = require("axios");
const LANGUAGE_VERSIONS = {
  python: "3.10.0",
  javascript: "18.15.0",
  cpp: "10.2.0",
  java: "15.0.2"
};
router.post("/submit", auth, async (req, res) => {
  try {
    const { problemSlug, code, language } = req.body;
    console.log("Received submission request:", { problemSlug, language });
    console.log("Fetching problem details from LeetCode API...");
    const leetcodeResponse = await axios.get(`https://leetcode-api-mu.vercel.app/select?titleSlug=${problemSlug}`);
    const problemData = leetcodeResponse.data;
    console.log("LeetCode API response:", problemData);
    const testCasesText = problemData.exampleTestcases;
    console.log("Raw test cases:", testCasesText);
    const testCases = [];
    const expectedOutputs = [];
    const lines = testCasesText.split('\n');
    let currentInput = [];
    let currentOutput = [];
    let isInput = true;

    for (const line of lines) {
      if (line.trim() === '') {
        if (currentInput.length > 0) {
          testCases.push(currentInput.join('\n'));
          currentInput = [];
        }
        if (currentOutput.length > 0) {
          expectedOutputs.push(currentOutput.join('\n'));
          currentOutput = [];
        }
        isInput = true;
      } else if (line.includes('Output:')) {
        isInput = false;
      } else if (isInput) {
        currentInput.push(line);
      } else {
        currentOutput.push(line);
      }
    }

    // Add the last test case if exists
    if (currentInput.length > 0) {
      testCases.push(currentInput.join('\n'));
    }
    if (currentOutput.length > 0) {
      expectedOutputs.push(currentOutput.join('\n'));
    }

    console.log("Parsed test cases:", testCases);
    console.log("Expected outputs:", expectedOutputs);

    const testResults = [];
    let allTestsPassed = true;
    const judgeUrl = process.env.JUDGE_URL || "https://emkc.org/api/v2/piston/execute";
    console.log("Using judge URL:", judgeUrl);
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const expectedOutput = expectedOutputs[i] || '';
      
      try {
        console.log(`Running test case ${i + 1}:`, testCase);
        
        const response = await axios.post(judgeUrl, {
          language,
          version: LANGUAGE_VERSIONS[language] || "3.10.0",
          files: [{ content: code }],
          stdin: testCase
        });

        console.log(`Judge API response for test case ${i + 1}:`, response.data);

        const { run } = response.data;
        const actualOutput = run.output?.trim() || '';
        
        console.log(`Test case ${i + 1} output:`, actualOutput);
        console.log(`Expected output:`, expectedOutput);
        const passed = actualOutput === expectedOutput && !run.stderr && !run.error;
        console.log(`Test case ${i + 1} passed:`, passed);
        
        const testResult = {
          input: testCase,
          output: actualOutput,
          expected: expectedOutput,
          passed,
          error: run.stderr || run.error || null
        };

        testResults.push(testResult);
        if (!passed) {
          allTestsPassed = false;
        }
      } catch (error) {
        console.error(`Error in test case ${i + 1}:`, error);
        testResults.push({
          input: testCase,
          expected: expectedOutput,
          error: error.message,
          passed: false
        });
        allTestsPassed = false;
      }
    }

    console.log("Sending response:", testResults);

    // Only save solution if all tests passed
    if (allTestsPassed) {
      const solution = new Solution({
        problemSlug,
        code,
        language,
        author: req.user.user_id,
      });

      await solution.save();
      console.log("Solution saved to database");

      // Explicitly construct the success response object including testResults
      const successResponse = {
        success: true,
        message: "Solution submitted successfully!",
        passed: true,
        details: "All test cases passed",
        testResults: testResults.map(result => ({
          input: result.input,
          output: result.output,
          expected: result.expected,
          passed: result.passed
          // Error is excluded here for a successful test case result
        }))
      };

      res.json(successResponse);
    } else {
      // Keep the existing failure response structure
      res.json({
        success: false,
        message: "Solution failed test cases",
        passed: false,
        details: "Some test cases failed",
        testResults: testResults.map(result => ({
          input: result.input,
          output: result.output,
          expected: result.expected,
          passed: result.passed,
          error: result.error
        }))
      });
    }

  } catch (err) {
    console.error("Error in submission:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred during submission and testing.",
      passed: false,
      details: err.message,
      testResults: [
        {
          input: "N/A",
          output: "N/A",
          expected: "N/A",
          passed: false,
          error: `Backend Error: ${err.message}`
        }
      ]
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    // Check if solution exists and user is the author
    if (!solution) {
      return res.status(404).json({ error: "Solution not found" });
    }
    console.log(solution.author, req.user.user_id);
    if (solution.author.toString() !== req.user.user_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this solution" });
    }

    await Solution.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Solution deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all solutions for a problem
router.get("/:problemSlug", async (req, res) => {
  try {
    const solutions = await Solution.find({
      problemSlug: req.params.problemSlug,
    })
      .populate("author", "Username _id")
      .sort({ createdAt: -1 });

    res.json(solutions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get solution detail
router.get("/detail/:id", async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id).populate(
      "author",
      "Username _id"
    );
    res.json(solution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle voting
router.post("/vote", async (req, res) => {
  try {
    const { solutionId, voteType } = req.body;
    const solution = await Solution.findById(solutionId);

    if (!solution) {
      return res.status(404).json({ error: "Solution not found" });
    }

    // Update votes
    solution.votes += voteType === "upvote" ? 1 : -1;
    await solution.save();

    res.json({ success: true, votes: solution.votes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
