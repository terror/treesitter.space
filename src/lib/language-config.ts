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

export const languageConfig = {
  javascript: {
    name: 'javascript',
    displayName: 'JavaScript',
    wasmPath: 'tree-sitter-javascript.wasm',
    sampleCode:
      'const calculateStats = (data = []) => {\n' +
      '  const sum = data.reduce((acc, val) => acc + val, 0);\n' +
      '  const avg = sum / (data.length || 1);\n' +
      '  \n' +
      '  return {\n' +
      '    count: data.length,\n' +
      '    sum,\n' +
      '    avg,\n' +
      '    min: Math.min(...(data.length ? data : [0])),\n' +
      '    max: Math.max(...(data.length ? data : [0])),\n' +
      '    has: val => data.includes(val),\n' +
      '  };\n' +
      '};\n' +
      '\n' +
      'class DataAnalyzer {\n' +
      '  #privateData = [];\n' +
      '  \n' +
      '  constructor(initialData) {\n' +
      '    this.#privateData = [...initialData];\n' +
      '  }\n' +
      '  \n' +
      '  addData(items) {\n' +
      '    this.#privateData.push(...items);\n' +
      '    return this;\n' +
      '  }\n' +
      '  \n' +
      '  get stats() {\n' +
      '    return calculateStats(this.#privateData);\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'const analyzer = new DataAnalyzer([23, 45, 12, 67]);\n' +
      'analyzer.addData([88, 91]);\n' +
      'console.log(`Stats: ${JSON.stringify(analyzer.stats)}`);\n' +
      '\n' +
      'const fetchUserData = async (userId) => {\n' +
      '  try {\n' +
      '    const response = await Promise.resolve({ name: "Alex", id: userId });\n' +
      '    const { name } = response;\n' +
      '    return `Hello, ${name}!`;\n' +
      '  } catch (error) {\n' +
      '    return `Error: ${error.message}`;\n' +
      '  }\n' +
      '};',
    cmExtension: javascript(),
  },
  python: {
    name: 'python',
    displayName: 'Python',
    wasmPath: 'tree-sitter-python.wasm',
    sampleCode:
      'from typing import List, Dict, Optional, Callable\n' +
      'from dataclasses import dataclass\n' +
      'from functools import reduce\n' +
      '\n' +
      '@dataclass\n' +
      'class Measurement:\n' +
      '  value: float\n' +
      '  unit: str\n' +
      '  timestamp: Optional[float] = None\n' +
      '  \n' +
      '  def convert(self, target_unit: str, conversion_fn: Callable) -> "Measurement":\n' +
      '    return Measurement(\n' +
      '      value=conversion_fn(self.value),\n' +
      '      unit=target_unit,\n' +
      '      timestamp=self.timestamp\n' +
      '    )\n' +
      '\n' +
      'def analyze_data(measurements: List[Measurement]) -> Dict:\n' +
      '  if not measurements:\n' +
      '    return {"count": 0, "avg": None}\n' +
      '    \n' +
      '  total = reduce(lambda acc, m: acc + m.value, measurements, 0)\n' +
      '  return {\n' +
      '    "count": len(measurements),\n' +
      '    "avg": total / len(measurements),\n' +
      '    "units": {m.unit for m in measurements},\n' +
      '    "values": [m.value for m in measurements]\n' +
      '  }\n' +
      '\n' +
      'data = [Measurement(value, "celsius") for value in [22.5, 19.8, 25.1, 20.0]]\n' +
      'result = analyze_data(data)\n' +
      "print(f\"Analyzed {result['count']} measurements, average: {result['avg']:.1f}°C\")",
    cmExtension: python(),
  },
  rust: {
    name: 'rust',
    displayName: 'Rust',
    wasmPath: 'tree-sitter-rust.wasm',
    sampleCode:
      'use std::collections::HashMap;\n' +
      '\n' +
      '#[derive(Debug, Clone)]\n' +
      'struct StockItem {\n' +
      '  name: String,\n' +
      '  price: f64,\n' +
      '  quantity: u32,\n' +
      '}\n' +
      '\n' +
      'impl StockItem {\n' +
      '  fn new(name: &str, price: f64, quantity: u32) -> Self {\n' +
      '    Self {\n' +
      '      name: name.to_string(),\n' +
      '      price,\n' +
      '      quantity,\n' +
      '    }\n' +
      '  }\n' +
      '  \n' +
      '  fn total_value(&self) -> f64 {\n' +
      '    self.price * self.quantity as f64\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'fn main() {\n' +
      '  let inventory = vec![\n' +
      '    StockItem::new("Laptop", 1200.0, 5),\n' +
      '    StockItem::new("Mouse", 25.5, 30),\n' +
      '    StockItem::new("Monitor", 350.0, 8),\n' +
      '  ];\n' +
      '  \n' +
      '  let total_inventory_value: f64 = inventory\n' +
      '    .iter()\n' +
      '    .map(|item| item.total_value())\n' +
      '    .sum();\n' +
      '    \n' +
      '  let most_valuable = inventory.iter().max_by(|a, b| {\n' +
      '    a.total_value().partial_cmp(&b.total_value()).unwrap()\n' +
      '  });\n' +
      '  \n' +
      '  match most_valuable {\n' +
      '    Some(item) => println!("Most valuable: {}, ${:.2}", item.name, item.total_value()),\n' +
      '    None => println!("Inventory is empty"),\n' +
      '  }\n' +
      '  \n' +
      '  println!("Total inventory value: ${:.2}", total_inventory_value);\n' +
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
      '#include <algorithm>\n' +
      '#include <memory>\n' +
      '#include <functional>\n' +
      '\n' +
      'class Device {\n' +
      'public:\n' +
      '  virtual ~Device() = default;\n' +
      '  virtual void process() const = 0;\n' +
      '  virtual std::string name() const = 0;\n' +
      '};\n' +
      '\n' +
      'class Sensor : public Device {\n' +
      'private:\n' +
      '  std::string id;\n' +
      '  double value;\n' +
      '  \n' +
      'public:\n' +
      '  Sensor(std::string id, double value) : id(std::move(id)), value(value) {}\n' +
      '  \n' +
      '  void process() const override {\n' +
      '    std::cout << "Sensor " << id << ": " << value << std::endl;\n' +
      '  }\n' +
      '  \n' +
      '  std::string name() const override { return "Sensor-" + id; }\n' +
      '};\n' +
      '\n' +
      'int main() {\n' +
      '  std::vector<std::unique_ptr<Device>> devices;\n' +
      '  \n' +
      '  auto add_sensor = [&devices](auto id, auto value) {\n' +
      '    devices.push_back(std::make_unique<Sensor>(id, value));\n' +
      '  };\n' +
      '  \n' +
      '  add_sensor("temp", 22.5);\n' +
      '  add_sensor("humidity", 45.2);\n' +
      '  \n' +
      '  for (const auto& device : devices) {\n' +
      '    device->process();\n' +
      '  }\n' +
      '  \n' +
      '  std::for_each(devices.begin(), devices.end(), [](const auto& d) {\n' +
      '    std::cout << "Device: " << d->name() << std::endl;\n' +
      '  });\n' +
      '  \n' +
      '  return 0;\n' +
      '}',
    cmExtension: cpp(),
  },
  java: {
    name: 'java',
    displayName: 'Java',
    wasmPath: 'tree-sitter-java.wasm',
    sampleCode:
      'import java.util.List;\n' +
      'import java.util.stream.Collectors;\n' +
      'import java.util.Optional;\n' +
      '\n' +
      'record Product(String id, String name, double price, Category category) {\n' +
      '  public enum Category { ELECTRONICS, BOOKS, CLOTHING }\n' +
      '  \n' +
      '  public boolean isExpensive() {\n' +
      '    return price > 100;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'public class Main {\n' +
      '  public static void main(String[] args) {\n' +
      '    var products = List.of(\n' +
      '      new Product("p1", "Laptop", 899.99, Product.Category.ELECTRONICS),\n' +
      '      new Product("p2", "Java Programming", 49.99, Product.Category.BOOKS),\n' +
      '      new Product("p3", "Smartphone", 699.99, Product.Category.ELECTRONICS),\n' +
      '      new Product("p4", "T-Shirt", 19.99, Product.Category.CLOTHING)\n' +
      '    );\n' +
      '    \n' +
      '    double totalElectronicsValue = products.stream()\n' +
      '      .filter(p -> p.category() == Product.Category.ELECTRONICS)\n' +
      '      .mapToDouble(Product::price)\n' +
      '      .sum();\n' +
      '      \n' +
      '    Optional<Product> cheapestProduct = products.stream()\n' +
      '      .min((p1, p2) -> Double.compare(p1.price(), p2.price()));\n' +
      '    \n' +
      '    cheapestProduct.ifPresent(p -> \n' +
      '      System.out.printf("Cheapest: %s, $%.2f%n", p.name(), p.price())\n' +
      '    );\n' +
      '    \n' +
      '    System.out.printf("Total electronics value: $%.2f%n", totalElectronicsValue);\n' +
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
      'declare(strict_types=1);\n' +
      '\n' +
      'class User {\n' +
      '  private int $id;\n' +
      '  private string $name;\n' +
      '  private array $roles;\n' +
      '  private ?string $email;\n' +
      '  \n' +
      '  public function __construct(\n' +
      '    int $id,\n' +
      '    string $name,\n' +
      '    array $roles = [],\n' +
      '    ?string $email = null\n' +
      '  ) {\n' +
      '    $this->id = $id;\n' +
      '    $this->name = $name;\n' +
      '    $this->roles = $roles;\n' +
      '    $this->email = $email;\n' +
      '  }\n' +
      '  \n' +
      '  public function hasRole(string $role): bool {\n' +
      '    return in_array($role, $this->roles);\n' +
      '  }\n' +
      '  \n' +
      '  public function getName(): string {\n' +
      '    return $this->name;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      '$users = [\n' +
      '  new User(1, "Alice", ["admin", "editor"]),\n' +
      '  new User(2, "Bob", ["user"]),\n' +
      '  new User(3, "Carol", ["editor"], "carol@example.com")\n' +
      '];\n' +
      '\n' +
      '$admins = array_filter($users, fn($user) => $user->hasRole("admin"));\n' +
      '$names = array_map(fn($user) => $user->getName(), $users);\n' +
      '\n' +
      'echo "Admins: " . count($admins) . "\\n";\n' +
      'echo "Users: " . implode(", ", $names) . "\\n";\n' +
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
      '  <title>Modern Web Components</title>\n' +
      '  <style>\n' +
      '    :root {\n' +
      '      --primary: #3a86ff;\n' +
      '      --accent: #ff006e;\n' +
      '      --dark: #1a1a1a;\n' +
      '      --light: #f8f9fa;\n' +
      '    }\n' +
      '    body {\n' +
      '      font-family: system-ui, sans-serif;\n' +
      '      line-height: 1.6;\n' +
      '      color: var(--dark);\n' +
      '      background: var(--light);\n' +
      '      margin: 0;\n' +
      '      display: grid;\n' +
      '      place-items: center;\n' +
      '      min-height: 100vh;\n' +
      '    }\n' +
      '    .card {\n' +
      '      max-width: 400px;\n' +
      '      border-radius: 8px;\n' +
      '      overflow: hidden;\n' +
      '      box-shadow: 0 10px 25px rgba(0,0,0,.1);\n' +
      '      background: white;\n' +
      '    }\n' +
      '    .card-img {\n' +
      '      height: 200px;\n' +
      '      background: linear-gradient(45deg, var(--primary), var(--accent));\n' +
      '      position: relative;\n' +
      '    }\n' +
      '    .badge {\n' +
      '      position: absolute;\n' +
      '      top: 12px;\n' +
      '      right: 12px;\n' +
      '      padding: 4px 12px;\n' +
      '      background: rgba(255,255,255,.9);\n' +
      '      border-radius: 20px;\n' +
      '      font-weight: 600;\n' +
      '      font-size: 0.8rem;\n' +
      '      color: var(--accent);\n' +
      '    }\n' +
      '    .card-content {\n' +
      '      padding: 24px;\n' +
      '    }\n' +
      '    .title {\n' +
      '      margin: 0 0 8px 0;\n' +
      '      color: var(--dark);\n' +
      '    }\n' +
      '    .btn {\n' +
      '      display: inline-block;\n' +
      '      padding: 8px 16px;\n' +
      '      background: var(--primary);\n' +
      '      color: white;\n' +
      '      border-radius: 4px;\n' +
      '      text-decoration: none;\n' +
      '      font-weight: 500;\n' +
      '      margin-top: 16px;\n' +
      '    }\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n' +
      '  <div class="card">\n' +
      '    <div class="card-img">\n' +
      '      <span class="badge">New</span>\n' +
      '    </div>\n' +
      '    <div class="card-content">\n' +
      '      <h2 class="title">Modern UI Components</h2>\n' +
      '      <p>Beautiful, responsive components using CSS variables and modern layout techniques.</p>\n' +
      '      <a href="#" class="btn">Learn More</a>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</body>\n' +
      '</html>',
    cmExtension: html(),
  },
  css: {
    name: 'css',
    displayName: 'CSS',
    wasmPath: 'tree-sitter-css.wasm',
    sampleCode:
      ':root {\n' +
      '  --color-primary: #4361ee;\n' +
      '  --color-secondary: #3a0ca3;\n' +
      '  --color-success: #4cc9f0;\n' +
      '  --color-warning: #f72585;\n' +
      '  --color-light: #f8f9fa;\n' +
      '  --color-dark: #212529;\n' +
      '  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\n' +
      '  --font-sans: system-ui, -apple-system, sans-serif;\n' +
      '}\n' +
      '\n' +
      '* {\n' +
      '  margin: 0;\n' +
      '  padding: 0;\n' +
      '  box-sizing: border-box;\n' +
      '}\n' +
      '\n' +
      'body {\n' +
      '  font-family: var(--font-sans);\n' +
      '  color: var(--color-dark);\n' +
      '  line-height: 1.5;\n' +
      '}\n' +
      '\n' +
      '.container {\n' +
      '  width: min(1200px, 90%);\n' +
      '  margin-inline: auto;\n' +
      '}\n' +
      '\n' +
      '.card {\n' +
      '  background-color: white;\n' +
      '  border-radius: 0.5rem;\n' +
      '  overflow: hidden;\n' +
      '  box-shadow: var(--shadow);\n' +
      '  transition: transform 0.3s ease;\n' +
      '}\n' +
      '\n' +
      '.card:hover {\n' +
      '  transform: translateY(-5px);\n' +
      '}\n' +
      '\n' +
      '.card-grid {\n' +
      '  display: grid;\n' +
      '  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n' +
      '  gap: 1.5rem;\n' +
      '}\n' +
      '\n' +
      '.btn {\n' +
      '  display: inline-flex;\n' +
      '  align-items: center;\n' +
      '  gap: 0.5rem;\n' +
      '  padding: 0.5rem 1rem;\n' +
      '  border-radius: 0.25rem;\n' +
      '  background-color: var(--color-primary);\n' +
      '  color: white;\n' +
      '  text-decoration: none;\n' +
      '}\n' +
      '\n' +
      '@media (prefers-color-scheme: dark) {\n' +
      '  body {\n' +
      '    background-color: var(--color-dark);\n' +
      '    color: var(--color-light);\n' +
      '  }\n' +
      '  \n' +
      '  .card {\n' +
      '    background-color: #2a2d3a;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      '@media (max-width: 768px) {\n' +
      '  .card-grid {\n' +
      '    grid-template-columns: 1fr;\n' +
      '  }\n' +
      '}',
    cmExtension: css(),
  },
  json: {
    name: 'json',
    displayName: 'JSON',
    wasmPath: 'tree-sitter-json.wasm',
    sampleCode:
      '{\n' +
      '  "api": {\n' +
      '    "name": "ProductCatalog",\n' +
      '    "version": "2.5.0",\n' +
      '    "baseUrl": "https://api.example.com/v2",\n' +
      '    "auth": {\n' +
      '      "type": "oauth2",\n' +
      '      "scopes": ["read", "write"]\n' +
      '    }\n' +
      '  },\n' +
      '  "products": [\n' +
      '    {\n' +
      '      "id": "p-1001",\n' +
      '      "name": "Smart Speaker",\n' +
      '      "price": 129.99,\n' +
      '      "category": "Electronics",\n' +
      '      "rating": 4.6,\n' +
      '      "inStock": true,\n' +
      '      "features": ["Voice Control", "Wi-Fi", "Bluetooth"],\n' +
      '      "dimensions": {\n' +
      '        "height": 180,\n' +
      '        "width": 120,\n' +
      '        "depth": 120,\n' +
      '        "unit": "mm"\n' +
      '      }\n' +
      '    },\n' +
      '    {\n' +
      '      "id": "p-1002",\n' +
      '      "name": "Wireless Headphones",\n' +
      '      "price": 89.99,\n' +
      '      "category": "Electronics",\n' +
      '      "rating": 4.8,\n' +
      '      "inStock": true,\n' +
      '      "features": ["Noise Cancelling", "Bluetooth 5.0", "40h Battery"],\n' +
      '      "dimensions": {\n' +
      '        "height": 220,\n' +
      '        "width": 165,\n' +
      '        "depth": 80,\n' +
      '        "unit": "mm"\n' +
      '      }\n' +
      '    }\n' +
      '  ],\n' +
      '  "metadata": {\n' +
      '    "generated": "2025-03-05T10:15:30Z",\n' +
      '    "totalProducts": 2,\n' +
      '    "currency": "USD"\n' +
      '  }\n' +
      '}',
    cmExtension: json(),
  },
  go: {
    name: 'go',
    displayName: 'Go',
    wasmPath: 'tree-sitter-go.wasm',
    sampleCode:
      'package main\n' +
      '\n' +
      'import (\n' +
      '  "encoding/json"\n' +
      '  "fmt"\n' +
      '  "log"\n' +
      '  "sync"\n' +
      '  "time"\n' +
      ')\n' +
      '\n' +
      'type Event struct {\n' +
      '  ID        string    `json:"id"`\n' +
      '  Name      string    `json:"name"`\n' +
      '  Timestamp time.Time `json:"timestamp"`\n' +
      '  Tags      []string  `json:"tags,omitempty"`\n' +
      '}\n' +
      '\n' +
      'type EventProcessor struct {\n' +
      '  events []Event\n' +
      '  mu     sync.RWMutex\n' +
      '}\n' +
      '\n' +
      'func NewEventProcessor() *EventProcessor {\n' +
      '  return &EventProcessor{events: make([]Event, 0)}\n' +
      '}\n' +
      '\n' +
      'func (ep *EventProcessor) AddEvent(event Event) {\n' +
      '  ep.mu.Lock()\n' +
      '  defer ep.mu.Unlock()\n' +
      '  ep.events = append(ep.events, event)\n' +
      '}\n' +
      '\n' +
      'func (ep *EventProcessor) FilterByTag(tag string) []Event {\n' +
      '  ep.mu.RLock()\n' +
      '  defer ep.mu.RUnlock()\n' +
      '  var filtered []Event\n' +
      '  \n' +
      '  for _, event := range ep.events {\n' +
      '    for _, t := range event.Tags {\n' +
      '      if t == tag {\n' +
      '        filtered = append(filtered, event)\n' +
      '        break\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  \n' +
      '  return filtered\n' +
      '}\n' +
      '\n' +
      'func main() {\n' +
      '  processor := NewEventProcessor()\n' +
      '  \n' +
      '  wg := sync.WaitGroup{}\n' +
      '  eventCh := make(chan Event, 3)\n' +
      '  \n' +
      '  go func() {\n' +
      '    events := []Event{\n' +
      '      {ID: "evt-001", Name: "Login", Timestamp: time.Now(), Tags: []string{"auth", "user"}},\n' +
      '      {ID: "evt-002", Name: "Purchase", Timestamp: time.Now(), Tags: []string{"transaction", "payment"}},\n' +
      '      {ID: "evt-003", Name: "Logout", Timestamp: time.Now(), Tags: []string{"auth", "user"}},\n' +
      '    }\n' +
      '    \n' +
      '    for _, evt := range events {\n' +
      '      eventCh <- evt\n' +
      '    }\n' +
      '    close(eventCh)\n' +
      '  }()\n' +
      '  \n' +
      '  wg.Add(1)\n' +
      '  go func() {\n' +
      '    defer wg.Done()\n' +
      '    for event := range eventCh {\n' +
      '      processor.AddEvent(event)\n' +
      '      fmt.Printf("Processed: %s\\n", event.ID)\n' +
      '    }\n' +
      '  }()\n' +
      '  \n' +
      '  wg.Wait()\n' +
      '  \n' +
      '  authEvents := processor.FilterByTag("auth")\n' +
      '  authData, _ := json.MarshalIndent(authEvents, "", "  ")\n' +
      '  fmt.Println(string(authData))\n' +
      '}',
    cmExtension: go(),
  },
};
