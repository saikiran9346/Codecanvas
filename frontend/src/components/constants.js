export const JUDGE0_LANGUAGE_IDS = {
  cpp: 105,
  python: 100,
  java: 91,
  javascript: 93
};

export const LANGUAGE_VERSIONS = {
  cpp: "GCC 14.1.0",
  python: "3.12.5",
  javascript: "Node.js 18.15.0",
  java: "JDK 17.0.6"
};

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const CODE_SNIPPETS = {
  python: `print("Hello, Python!")`,
  javascript: `console.log("Hello, JavaScript!");`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`
};
