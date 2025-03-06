import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { go } from '@codemirror/lang-go';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { php } from '@codemirror/lang-php';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import type { LanguageConfig, SupportedLanguage } from './types';

export const languageConfig: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    name: 'javascript',
    displayName: 'JavaScript',
    wasmPath: 'tree-sitter-javascript.wasm',
    sampleCode:
      '// Interactive greeting app\n' +
      'const userName = "Explorer";\n' +
      'let visitCount = 1;\n\n' +
      'function createGreeting(name, count) {\n' +
      '  const time = new Date().getHours();\n' +
      '  let greeting = "";\n\n' +
      '  if (time < 12) greeting = "Good morning";\n' +
      '  else if (time < 18) greeting = "Good afternoon";\n' +
      '  else greeting = "Good evening";\n\n' +
      '  console.log(`${greeting}, ${name}!`);\n' +
      '  console.log(`This is visit #${count}`);\n' +
      '  return count + 1;\n' +
      '}\n\n' +
      'visitCount = createGreeting(userName, visitCount);\n' +
      'console.log("Welcome to the interactive console!");',
    cmExtension: javascript(),
  },
  python: {
    name: 'python',
    displayName: 'Python',
    wasmPath: 'tree-sitter-python.wasm',
    sampleCode:
      '# Temperature converter with validation\n' +
      'import random\n\n' +
      'def celsius_to_fahrenheit(celsius):\n' +
      '  """Convert Celsius to Fahrenheit temperature."""\n' +
      '  if not isinstance(celsius, (int, float)):\n' +
      '    raise TypeError("Temperature must be a number")\n' +
      '  return (celsius * 9/5) + 32\n\n' +
      'def fahrenheit_to_celsius(fahrenheit):\n' +
      '  """Convert Fahrenheit to Celsius temperature."""\n' +
      '  if not isinstance(fahrenheit, (int, float)):\n' +
      '    raise TypeError("Temperature must be a number")\n' +
      '  return (fahrenheit - 32) * 5/9\n\n' +
      '# Generate random temperatures to convert\n' +
      'for _ in range(3):\n' +
      '  temp_c = round(random.uniform(-10, 40), 1)\n' +
      '  temp_f = celsius_to_fahrenheit(temp_c)\n' +
      '  print(f"{temp_c}°C = {temp_f:.1f}°F")\n' +
      '  \n' +
      '  temp_f = round(random.uniform(0, 100), 1)\n' +
      '  temp_c = fahrenheit_to_celsius(temp_f)\n' +
      '  print(f"{temp_f}°F = {temp_c:.1f}°C")',
    cmExtension: python(),
  },
  rust: {
    name: 'rust',
    displayName: 'Rust',
    wasmPath: 'tree-sitter-rust.wasm',
    sampleCode:
      '// A Fibonacci sequence generator with memoization\n' +
      'use std::collections::HashMap;\n' +
      'use std::io;\n\n' +
      'struct FibCalculator {\n' +
      '    cache: HashMap<u64, u64>,\n' +
      '}\n\n' +
      'impl FibCalculator {\n' +
      '    fn new() -> Self {\n' +
      '        let mut cache = HashMap::new();\n' +
      '        cache.insert(0, 0);\n' +
      '        cache.insert(1, 1);\n' +
      '        FibCalculator { cache }\n' +
      '    }\n\n' +
      '    fn calculate(&mut self, n: u64) -> u64 {\n' +
      '        if let Some(&result) = self.cache.get(&n) {\n' +
      '            return result;\n' +
      '        }\n' +
      '        let result = self.calculate(n - 1) + self.calculate(n - 2);\n' +
      '        self.cache.insert(n, result);\n' +
      '        result\n' +
      '    }\n' +
      '}\n\n' +
      'fn main() {\n' +
      '    println!("Fibonacci Sequence Generator");\n' +
      '    let mut calculator = FibCalculator::new();\n\n' +
      '    for i in 0..10 {\n' +
      '        let result = calculator.calculate(i);\n' +
      '        println!("Fibonacci({}) = {}", i, result);\n' +
      '    }\n' +
      '}',
    cmExtension: rust(),
  },
  cpp: {
    name: 'cpp',
    displayName: 'C++',
    wasmPath: 'tree-sitter-cpp.wasm',
    sampleCode:
      '#include <iostream>\n' +
      '#include <vector>\n' +
      '#include <string>\n' +
      '#include <algorithm>\n\n' +
      'class Student {\n' +
      'private:\n' +
      '  std::string name;\n' +
      '  int id;\n' +
      '  std::vector<double> grades;\n\n' +
      'public:\n' +
      '  Student(std::string n, int i) : name(n), id(i) {}\n\n' +
      '  void addGrade(double grade) {\n' +
      '    if (grade >= 0.0 && grade <= 100.0) {\n' +
      '      grades.push_back(grade);\n' +
      '    } else {\n' +
      '      std::cerr << "Invalid grade: " << grade << std::endl;\n' +
      '    }\n' +
      '  }\n\n' +
      '  double getAverage() const {\n' +
      '    if (grades.empty()) return 0.0;\n' +
      '    double sum = 0.0;\n' +
      '    for (double grade : grades) {\n' +
      '      sum += grade;\n' +
      '    }\n' +
      '    return sum / grades.size();\n' +
      '  }\n\n' +
      '  std::string getName() const { return name; }\n' +
      '  int getId() const { return id; }\n' +
      '};\n\n' +
      'int main() {\n' +
      '  std::vector<Student> students;\n' +
      '  \n' +
      '  students.push_back(Student("Alice", 1001));\n' +
      '  students.push_back(Student("Bob", 1002));\n' +
      '  students.push_back(Student("Charlie", 1003));\n\n' +
      '  students[0].addGrade(92.5);\n' +
      '  students[0].addGrade(88.0);\n' +
      '  students[0].addGrade(95.5);\n\n' +
      '  students[1].addGrade(75.0);\n' +
      '  students[1].addGrade(83.5);\n\n' +
      '  students[2].addGrade(91.0);\n' +
      '  students[2].addGrade(89.5);\n' +
      '  students[2].addGrade(94.0);\n\n' +
      '  std::cout << "Student Grade Report:" << std::endl;\n' +
      '  std::cout << "---------------------" << std::endl;\n\n' +
      '  for (const auto& student : students) {\n' +
      '    std::cout << "ID: " << student.getId() << ", Name: " << student.getName()\n' +
      '              << ", Average: " << student.getAverage() << std::endl;\n' +
      '  }\n\n' +
      '  return 0;\n' +
      '}',
    cmExtension: cpp(),
  },
  java: {
    name: 'java',
    displayName: 'Java',
    wasmPath: 'tree-sitter-java.wasm',
    sampleCode:
      'import java.util.ArrayList;\n' +
      'import java.util.Scanner;\n' +
      'import java.util.Random;\n\n' +
      'class Task {\n' +
      '  private String description;\n' +
      '  private boolean completed;\n' +
      '  private int priority;\n\n' +
      '  public Task(String description, int priority) {\n' +
      '    this.description = description;\n' +
      '    this.completed = false;\n' +
      '    this.priority = priority;\n' +
      '  }\n\n' +
      '  public String getDescription() { return description; }\n' +
      '  public boolean isCompleted() { return completed; }\n' +
      '  public int getPriority() { return priority; }\n' +
      '  public void markCompleted() { this.completed = true; }\n\n' +
      '  @Override\n' +
      '  public String toString() {\n' +
      '    return String.format("[%s] %s (Priority: %d)",\n' +
      '      completed ? "✓" : " ", description, priority);\n' +
      '  }\n' +
      '}\n\n' +
      'public class Main {\n' +
      '  public static void main(String[] args) {\n' +
      '    ArrayList<Task> tasks = new ArrayList<>();\n' +
      '    Random random = new Random();\n\n' +
      '    // Sample tasks\n' +
      '    tasks.add(new Task("Complete Java assignment", 1));\n' +
      '    tasks.add(new Task("Read chapter 10", 2));\n' +
      '    tasks.add(new Task("Prepare for quiz", 1));\n' +
      '    tasks.add(new Task("Research project topics", 3));\n\n' +
      '    // Mark random tasks as completed\n' +
      '    for (int i = 0; i < 2; i++) {\n' +
      '      int index = random.nextInt(tasks.size());\n' +
      '      tasks.get(index).markCompleted();\n' +
      '    }\n\n' +
      '    // Display all tasks\n' +
      '    System.out.println("=== Task Manager ===");\n' +
      '    for (int i = 0; i < tasks.size(); i++) {\n' +
      '      System.out.println((i + 1) + ". " + tasks.get(i));\n' +
      '    }\n\n' +
      '    // Summary\n' +
      '    long completedCount = tasks.stream().filter(Task::isCompleted).count();\n' +
      '    System.out.println("\\nCompleted: " + completedCount + "/" + tasks.size() + " tasks");\n' +
      '  }\n' +
      '}',
    cmExtension: java(),
  },
  php: {
    name: 'php',
    displayName: 'PHP',
    wasmPath: 'tree-sitter-php.wasm',
    sampleCode:
      '<?php\n' +
      '// Recipe Management System\n' +
      'class Recipe {\n' +
      '  private $name;\n' +
      '  private $ingredients = [];\n' +
      '  private $preparationTime;\n' +
      '  private $difficulty;\n\n' +
      '  public function __construct($name, $preparationTime, $difficulty) {\n' +
      '    $this->name = $name;\n' +
      '    $this->preparationTime = $preparationTime;\n' +
      '    $this->difficulty = $difficulty;\n' +
      '  }\n\n' +
      '  public function addIngredient($ingredient, $amount, $unit) {\n' +
      '    $this->ingredients[] = [\n' +
      '      "name" => $ingredient,\n' +
      '      "amount" => $amount,\n' +
      '      "unit" => $unit\n' +
      '    ];\n' +
      '  }\n\n' +
      '  public function getName() {\n' +
      '    return $this->name;\n' +
      '  }\n\n' +
      '  public function getIngredients() {\n' +
      '    return $this->ingredients;\n' +
      '  }\n\n' +
      '  public function getDifficulty() {\n' +
      '    return $this->difficulty;\n' +
      '  }\n\n' +
      '  public function getPreparationTime() {\n' +
      '    return $this->preparationTime;\n' +
      '  }\n' +
      '}\n\n' +
      '// Create recipe collection\n' +
      '$recipes = [];\n\n' +
      '// Add sample recipe\n' +
      '$pancakes = new Recipe("Fluffy Pancakes", 25, "Easy");\n' +
      '$pancakes->addIngredient("Flour", 2, "cups");\n' +
      '$pancakes->addIngredient("Milk", 1.5, "cups");\n' +
      '$pancakes->addIngredient("Eggs", 2, "");\n' +
      '$pancakes->addIngredient("Baking Powder", 2, "tsp");\n' +
      '$pancakes->addIngredient("Sugar", 3, "tbsp");\n' +
      '$pancakes->addIngredient("Salt", 0.5, "tsp");\n' +
      '$pancakes->addIngredient("Butter", 2, "tbsp");\n' +
      '$recipes[] = $pancakes;\n\n' +
      '// Display recipe\n' +
      'echo "<h1>Recipe Book</h1>";\n\n' +
      'foreach ($recipes as $recipe) {\n' +
      '  echo "<h2>" . $recipe->getName() . "</h2>";\n' +
      '  echo "<p><strong>Difficulty:</strong> " . $recipe->getDifficulty() . "</p>";\n' +
      '  echo "<p><strong>Preparation Time:</strong> " . $recipe->getPreparationTime() . " minutes</p>";\n\n' +
      '  echo "<h3>Ingredients:</h3>";\n' +
      '  echo "<ul>";\n' +
      '  foreach ($recipe->getIngredients() as $ingredient) {\n' +
      '    echo "<li>" . $ingredient["amount"] . " " . $ingredient["unit"] . " " . $ingredient["name"] . "</li>";\n' +
      '  }\n' +
      '  echo "</ul>";\n' +
      '}\n' +
      '?>',
    cmExtension: php(),
  },
  html: {
    name: 'html',
    displayName: 'HTML',
    wasmPath: 'tree-sitter-html.wasm',
    sampleCode:
      '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '  <title>Photography Portfolio</title>\n' +
      '  <style>\n' +
      '    :root {\n' +
      '      --primary-color: #3a4e6a;\n' +
      '      --accent-color: #e07a5f;\n' +
      '      --light-color: #f2f5f9;\n' +
      '      --dark-color: #2f3a4a;\n' +
      '    }\n' +
      '    body {\n' +
      '      font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;\n' +
      '      line-height: 1.6;\n' +
      '      color: var(--dark-color);\n' +
      '      background-color: var(--light-color);\n' +
      '      margin: 0;\n' +
      '      padding: 0;\n' +
      '    }\n' +
      '    header {\n' +
      '      background-color: var(--primary-color);\n' +
      '      color: white;\n' +
      '      padding: 2rem 0;\n' +
      '      text-align: center;\n' +
      '    }\n' +
      '    .gallery {\n' +
      '      display: grid;\n' +
      '      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n' +
      '      gap: 1.5rem;\n' +
      '      padding: 2rem;\n' +
      '    }\n' +
      '    .gallery-item {\n' +
      '      overflow: hidden;\n' +
      '      border-radius: 8px;\n' +
      '      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);\n' +
      '      transition: transform 0.3s ease;\n' +
      '    }\n' +
      '    .gallery-item:hover {\n' +
      '      transform: translateY(-5px);\n' +
      '    }\n' +
      '    .gallery-item img {\n' +
      '      width: 100%;\n' +
      '      height: 250px;\n' +
      '      object-fit: cover;\n' +
      '      display: block;\n' +
      '    }\n' +
      '    .gallery-item .caption {\n' +
      '      padding: 1rem;\n' +
      '      background-color: white;\n' +
      '    }\n' +
      '    footer {\n' +
      '      background-color: var(--primary-color);\n' +
      '      color: white;\n' +
      '      text-align: center;\n' +
      '      padding: 1rem 0;\n' +
      '      margin-top: 2rem;\n' +
      '    }\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n' +
      '  <header>\n' +
      '    <h1>Nature Through My Lens</h1>\n' +
      '    <p>A photography portfolio by Maria Sanchez</p>\n' +
      '  </header>\n\n' +
      '  <main>\n' +
      '    <section class="gallery">\n' +
      '      <div class="gallery-item">\n' +
      '        <img src="https://placeholder.pics/svg/300x250/DEDEDE/555555/Mountain%20View" alt="Mountain landscape at sunset">\n' +
      '        <div class="caption">\n' +
      '          <h3>Mountain Twilight</h3>\n' +
      '          <p>Sierra Nevada, California</p>\n' +
      '        </div>\n' +
      '      </div>\n' +
      '      <div class="gallery-item">\n' +
      '        <img src="https://placeholder.pics/svg/300x250/DEDEDE/555555/Ocean%20Waves" alt="Crashing waves on rocky shore">\n' +
      '        <div class="caption">\n' +
      '          <h3>Coastal Rhythm</h3>\n' +
      '          <p>Big Sur, California</p>\n' +
      '        </div>\n' +
      '      </div>\n' +
      '      <div class="gallery-item">\n' +
      '        <img src="https://placeholder.pics/svg/300x250/DEDEDE/555555/Desert%20Sunset" alt="Desert landscape at sunset">\n' +
      '        <div class="caption">\n' +
      '          <h3>Desert Gold</h3>\n' +
      '          <p>Death Valley, California</p>\n' +
      '        </div>\n' +
      '      </div>\n' +
      '    </section>\n' +
      '  </main>\n\n' +
      '  <footer>\n' +
      '    <p>© 2025 Maria Sanchez Photography. All rights reserved.</p>\n' +
      '  </footer>\n' +
      '</body>\n' +
      '</html>',
    cmExtension: html(),
  },
  css: {
    name: 'css',
    displayName: 'CSS',
    wasmPath: 'tree-sitter-css.wasm',
    sampleCode:
      '/* Modern Dashboard UI Styles */\n' +
      ':root {\n' +
      '  --primary: #4c6ef5;\n' +
      '  --primary-light: #e5ebff;\n' +
      '  --success: #40c057;\n' +
      '  --warning: #fab005;\n' +
      '  --danger: #fa5252;\n' +
      '  --gray-100: #f8f9fa;\n' +
      '  --gray-200: #e9ecef;\n' +
      '  --gray-300: #dee2e6;\n' +
      '  --gray-800: #343a40;\n' +
      '  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);\n' +
      '  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);\n' +
      '  --radius: 8px;\n' +
      '}\n\n' +
      '* {\n' +
      '  margin: 0;\n' +
      '  padding: 0;\n' +
      '  box-sizing: border-box;\n' +
      '}\n\n' +
      'body {\n' +
      '  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;\n' +
      '  background-color: var(--gray-100);\n' +
      '  color: var(--gray-800);\n' +
      '  line-height: 1.5;\n' +
      '}\n\n' +
      '.dashboard {\n' +
      '  display: grid;\n' +
      '  grid-template-columns: 240px 1fr;\n' +
      '  min-height: 100vh;\n' +
      '}\n\n' +
      '.sidebar {\n' +
      '  background-color: white;\n' +
      '  border-right: 1px solid var(--gray-200);\n' +
      '  padding: 1.5rem;\n' +
      '}\n\n' +
      '.sidebar-logo {\n' +
      '  display: flex;\n' +
      '  align-items: center;\n' +
      '  font-weight: 700;\n' +
      '  font-size: 1.25rem;\n' +
      '  margin-bottom: 2rem;\n' +
      '  color: var(--primary);\n' +
      '}\n\n' +
      '.sidebar-logo svg {\n' +
      '  width: 24px;\n' +
      '  height: 24px;\n' +
      '  margin-right: 0.75rem;\n' +
      '}\n\n' +
      '.nav-item {\n' +
      '  display: flex;\n' +
      '  align-items: center;\n' +
      '  padding: 0.75rem 1rem;\n' +
      '  border-radius: var(--radius);\n' +
      '  color: var(--gray-800);\n' +
      '  margin-bottom: 0.5rem;\n' +
      '  transition: all 0.2s;\n' +
      '}\n\n' +
      '.nav-item.active, .nav-item:hover {\n' +
      '  background-color: var(--primary-light);\n' +
      '  color: var(--primary);\n' +
      '}\n\n' +
      '.content {\n' +
      '  padding: 2rem;\n' +
      '}\n\n' +
      '.page-title {\n' +
      '  font-weight: 700;\n' +
      '  font-size: 1.5rem;\n' +
      '  margin-bottom: 1.5rem;\n' +
      '}\n\n' +
      '.stats-grid {\n' +
      '  display: grid;\n' +
      '  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n' +
      '  gap: 1.5rem;\n' +
      '  margin-bottom: 2rem;\n' +
      '}\n\n' +
      '.stat-card {\n' +
      '  background-color: white;\n' +
      '  border-radius: var(--radius);\n' +
      '  padding: 1.5rem;\n' +
      '  box-shadow: var(--shadow-sm);\n' +
      '}\n\n' +
      '.stat-title {\n' +
      '  color: #6c757d;\n' +
      '  font-size: 0.875rem;\n' +
      '  margin-bottom: 0.5rem;\n' +
      '}\n\n' +
      '.stat-value {\n' +
      '  font-size: 1.5rem;\n' +
      '  font-weight: 700;\n' +
      '  margin-bottom: 0.25rem;\n' +
      '}\n\n' +
      '.stat-change {\n' +
      '  font-size: 0.875rem;\n' +
      '}\n\n' +
      '.stat-change.positive {\n' +
      '  color: var(--success);\n' +
      '}\n\n' +
      '.stat-change.negative {\n' +
      '  color: var(--danger);\n' +
      '}\n\n' +
      '.chart-container {\n' +
      '  background-color: white;\n' +
      '  border-radius: var(--radius);\n' +
      '  padding: 1.5rem;\n' +
      '  box-shadow: var(--shadow-sm);\n' +
      '  margin-bottom: 1.5rem;\n' +
      '}\n\n' +
      '.chart-header {\n' +
      '  display: flex;\n' +
      '  justify-content: space-between;\n',
    cmExtension: css(),
  },
  json: {
    name: 'json',
    displayName: 'JSON',
    wasmPath: 'tree-sitter-json.wasm',
    sampleCode:
      '{\n' +
      '  "apiVersion": "2.0",\n' +
      '  "metadata": {\n' +
      '    "generated": "2025-03-05T10:12:08Z",\n' +
      '    "requestId": "f8d7e991-b5ac-4e9d-a3c8-1d4a06abe5f2"\n' +
      '  },\n' +
      '  "dashboard": {\n' +
      '    "name": "Sales Performance Q1 2025",\n' +
      '    "description": "Quarterly sales metrics and KPIs",\n' +
      '    "owner": {\n' +
      '      "id": "u-29481",\n' +
      '      "name": "Sarah Chen",\n' +
      '      "email": "sarah.chen@example.com",\n' +
      '      "department": "Sales Operations"\n' +
      '    },\n' +
      '    "metrics": [\n' +
      '      {\n' +
      '        "id": "m-001",\n' +
      '        "name": "Quarterly Revenue",\n' +
      '        "value": 1458750.25,\n' +
      '        "currency": "USD",\n' +
      '        "trend": 12.3,\n' +
      '        "status": "positive",\n' +
      '        "target": 1400000,\n' +
      '        "targetAchieved": true\n' +
      '      },\n' +
      '      {\n' +
      '        "id": "m-002",\n' +
      '        "name": "New Customers",\n' +
      '        "value": 1827,\n' +
      '        "trend": 5.6,\n' +
      '        "status": "positive",\n' +
      '        "target": 2000,\n' +
      '        "targetAchieved": false\n' +
      '      },\n' +
      '      {\n' +
      '        "id": "m-003",\n' +
      '        "name": "Average Deal Size",\n' +
      '        "value": 24650.75,\n' +
      '        "currency": "USD",\n' +
      '        "trend": 8.2,\n' +
      '        "status": "positive",\n' +
      '        "target": 22000,\n' +
      '        "targetAchieved": true\n' +
      '      },\n' +
      '      {\n' +
      '        "id": "m-004",\n' +
      '        "name": "Sales Cycle Duration",\n' +
      '        "value": 32.5,\n' +
      '        "unit": "days",\n' +
      '        "trend": -3.1,\n' +
      '        "status": "positive",\n' +
      '        "target": 35,\n' +
      '        "targetAchieved": true\n' +
      '      }\n' +
      '    ],\n' +
      '    "regionalBreakdown": {\n' +
      '      "northAmerica": {\n' +
      '        "revenue": 685612.50,\n' +
      '        "deals": 287,\n' +
      '        "conversionRate": 42.8\n' +
      '      },\n' +
      '      "europe": {\n' +
      '        "revenue": 498725.75,\n' +
      '        "deals": 215,\n' +
      '        "conversionRate": 38.2\n' +
      '      },\n' +
      '      "asiaPacific": {\n' +
      '        "revenue": 274412.00,\n' +
      '        "deals": 124,\n' +
      '        "conversionRate": 36.5\n' +
      '      }\n' +
      '    },\n' +
      '    "topPerformers": [\n' +
      '      {"name": "Michael Rodriguez", "revenue": 287500.00, "deals": 12},\n' +
      '      {"name": "Aisha Johnson", "revenue": 242750.50, "deals": 10},\n' +
      '      {"name": "Daniel Kim", "revenue": 198300.75, "deals": 8}\n' +
      '    ],\n' +
      '    "lastUpdated": "2025-03-04T16:30:22Z"\n' +
      '  }\n' +
      '}',
    cmExtension: json(),
  },
  go: {
    name: 'go',
    displayName: 'Go',
    wasmPath: 'tree-sitter-go.wasm',
    sampleCode:
      'package main\n\n' +
      'import (\n' +
      '  "encoding/json"\n' +
      '  "fmt"\n' +
      '  "log"\n' +
      '  "net/http"\n' +
      '  "sort"\n' +
      '  "sync"\n' +
      '  "time"\n' +
      ')\n\n' +
      '// Book represents a book entity in our bookstore\n' +
      'type Book struct {\n' +
      '  ID        string    `json:"id"`\n' +
      '  Title     string    `json:"title"`\n' +
      '  Author    string    `json:"author"`\n' +
      '  Price     float64   `json:"price"`\n' +
      '  Rating    float64   `json:"rating"`\n' +
      '  Genre     string    `json:"genre"`\n' +
      '  Available bool      `json:"available"`\n' +
      '  AddedAt   time.Time `json:"addedAt"`\n' +
      '}\n\n' +
      '// BookStore manages a collection of books\n' +
      'type BookStore struct {\n' +
      '  books  map[string]Book\n' +
      '  mutex  sync.RWMutex\n' +
      '  lastID int\n' +
      '}\n\n' +
      '// NewBookStore creates a new bookstore with sample data\n' +
      'func NewBookStore() *BookStore {\n' +
      '  store := &BookStore{\n' +
      '    books:  make(map[string]Book),\n' +
      '    lastID: 0,\n' +
      '  }\n\n' +
      '  // Add sample books\n' +
      '  store.AddBook(Book{\n' +
      '    Title:     "The Go Programming Language",\n' +
      '    Author:    "Alan A. A. Donovan & Brian W. Kernighan",\n' +
      '    Price:     34.99,\n' +
      '    Rating:    4.7,\n' +
      '    Genre:     "Programming",\n' +
      '    Available: true,\n' +
      '  })\n' +
      '  \n' +
      '  store.AddBook(Book{\n' +
      '    Title:     "Designing Data-Intensive Applications",\n' +
      '    Author:    "Martin Kleppmann",\n' +
      '    Price:     39.99,\n' +
      '    Rating:    4.8,\n' +
      '    Genre:     "Computer Science",\n' +
      '    Available: true,\n' +
      '  })\n' +
      '  \n' +
      '  store.AddBook(Book{\n' +
      '    Title:     "Clean Code",\n' +
      '    Author:    "Robert C. Martin",\n' +
      '    Price:     29.99,\n' +
      '    Rating:    4.6,\n' +
      '    Genre:     "Software Engineering",\n' +
      '    Available: false,\n' +
      '  })\n' +
      '  \n' +
      '  return store\n' +
      '}\n\n' +
      '// AddBook adds a new book to the store\n' +
      'func (bs *BookStore) AddBook(book Book) string {\n' +
      '  bs.mutex.Lock()\n' +
      '  defer bs.mutex.Unlock()\n\n' +
      '  bs.lastID++\n' +
      '  id := fmt.Sprintf("book-%d", bs.lastID)\n' +
      '  book.ID = id\n' +
      '  book.AddedAt = time.Now()\n' +
      '  bs.books[id] = book\n' +
      '  return id\n' +
      '}\n\n' +
      '// GetBooksByRating returns books sorted by rating (highest first)\n' +
      'func (bs *BookStore) GetBooksByRating() []Book {\n' +
      '  bs.mutex.RLock()\n' +
      '  defer bs.mutex.RUnlock()\n\n' +
      '  books := make([]Book, 0, len(bs.books))\n' +
      '  for _, book := range bs.books {\n' +
      '    books = append(books, book)\n' +
      '  }\n\n' +
      '  sort.Slice(books, func(i, j int) bool {\n' +
      '    return books[i].Rating > books[j].Rating\n' +
      '  })\n\n' +
      '  return books\n' +
      '}\n\n' +
      'func main() {\n' +
      '  store := NewBookStore()\n' +
      '  books := store.GetBooksByRating()\n\n' +
      '  fmt.Println("📚 Bookstore Inventory (Sorted by Rating):")\n' +
      '  fmt.Println("============================================")\n\n' +
      '  for _, book := range books {\n' +
      '    availability := "In Stock"\n' +
      '    if !book.Available {\n' +
      '      availability = "Out of Stock"\n' +
      '    }\n' +
      '    fmt.Printf("Title: %s\\n", book.Title)\n' +
      '    fmt.Printf("Author: %s\\n", book.Author)\n' +
      '    fmt.Printf("Genre: %s\\n", book.Genre)\n' +
      '    fmt.Printf("Rating: %.1f/5.0\\n", book.Rating)\n' +
      '    fmt.Printf("Price: $%.2f\\n", book.Price)\n' +
      '    fmt.Printf("Status: %s\\n", availability)\n' +
      '    fmt.Println("-------------------------------------------")\n' +
      '  }\n' +
      '}',
    cmExtension: go(),
  },
};
