// NeuroCode ML Sandbox Levels Data

const LEVELS = [
  {
    id: 1,
    title: "Level 1: The Linear Predictor",
    objective: "Implement a linear regression prediction model.",
    theory: `
      <p>In Machine Learning, a model makes predictions by mapping inputs to outputs. The simplest model is the <strong>Linear Predictor</strong>, which represents a straight line. It is defined by the mathematical equation:</p>
      <div class="math-block">$$y = w \\cdot x + b$$</div>
      <p>Where:</p>
      <ul>
        <li><strong>$x$</strong> is the input feature (e.g., house size).</li>
        <li><strong>$w$</strong> is the weight (slope of the line, representing the impact of the feature).</li>
        <li><strong>$b$</strong> is the bias (y-intercept, shifting the line up or down).</li>
        <li><strong>$y$</strong> is the predicted output (e.g., house price).</li>
      </ul>
      <p>Your task is to write the JavaScript code to compute and return this prediction.</p>
    `,
    codingTask: "Write a function <code>predict(x, w, b)</code> that calculates the linear equation $w \\cdot x + b$ and returns the result.",
    starterCode: `function predict(x, w, b) {
  // TODO: Calculate y = w * x + b
  return 0;
}`,
    hint: "Multiply the input x by the weight w, then add the bias b. Return that value.",
    solution: `function predict(x, w, b) {
  return w * x + b;
}`,
    testCases: [
      { inputs: [2, 3, 4], expected: 10, label: "x = 2, w = 3, b = 4" },
      { inputs: [0, -1, 5], expected: 5, label: "x = 0, w = -1, b = 5" },
      { inputs: [-3, 1.5, 2], expected: -2.5, label: "x = -3, w = 1.5, b = 2" }
    ],
    visualSettings: {
      type: "linear",
      dataPoints: [
        { x: -2, y: -3 },
        { x: -1, y: -1 },
        { x: 0, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 5 }
      ],
      initialParams: { w: 0.5, b: 0 }
    }
  },
  {
    id: 2,
    title: "Level 2: Gradient Descent Optimizer",
    objective: "Implement the parameter update step of Gradient Descent.",
    theory: `
      <p>How does a machine learning model actually learn? It uses <strong>Gradient Descent</strong>, an optimization algorithm that adjusts weights and biases to reduce prediction errors (Loss).</p>
      <p>At each step, we calculate gradients ($dw$ and $db$) which indicate the direction of the error. We then update our parameters by nudging them in the <em>opposite</em> direction of the gradient, scaled by a <strong>Learning Rate</strong> ($\\alpha$):</p>
      <div class="math-block">$$w \\leftarrow w - \\alpha \\cdot dw$$</div>
      <div class="math-block">$$b \\leftarrow b - \\alpha \\cdot db$$</div>
      <p>If the learning rate is too large, the updates overshoot; if it is too small, learning takes too long.</p>
    `,
    codingTask: "Write a function <code>updateParameters(w, b, dw, db, learningRate)</code> that calculates the updated parameter values and returns them in an object: <code>{ w: updatedW, b: updatedB }</code>.",
    starterCode: `function updateParameters(w, b, dw, db, learningRate) {
  // TODO: Calculate new w and b using the update formula
  return {
    w: w,
    b: b
  };
}`,
    hint: "Subtract the product of learningRate and gradient (dw or db) from the current value (w or b).",
    solution: `function updateParameters(w, b, dw, db, learningRate) {
  let updatedW = w - learningRate * dw;
  let updatedB = b - learningRate * db;
  return { w: updatedW, b: updatedB };
}`,
    testCases: [
      { 
        inputs: [1.0, 0.5, 0.1, 0.2, 0.1], 
        expected: { w: 0.99, b: 0.48 }, 
        label: "w=1.0, b=0.5, dw=0.1, db=0.2, alpha=0.1" 
      },
      { 
        inputs: [2.0, -1.0, -0.5, 1.0, 0.05], 
        expected: { w: 2.025, b: -1.05 }, 
        label: "w=2.0, b=-1.0, dw=-0.5, db=1.0, alpha=0.05" 
      }
    ],
    visualSettings: {
      type: "descent",
      initialParams: { w: -1.5, b: -1.0, targetW: 1.8, targetB: 0.6 }
    }
  },
  {
    id: 3,
    title: "Level 3: Sigmoid Activation Function",
    objective: "Implement the Sigmoid mathematical function.",
    theory: `
      <p>Linear models are limited because the real world is non-linear. To handle complex patterns, Neural Networks introduce non-linearities using <strong>Activation Functions</strong>.</p>
      <p>One of the most famous is the <strong>Sigmoid Activation Function</strong>. It squashes any input number into a range between 0 and 1, which represents a probability in classification tasks:</p>
      <div class="math-block">$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$</div>
      <p>Where:</p>
      <ul>
        <li><strong>$z$</strong> is the input value (weighted sum).</li>
        <li><strong>$e$</strong> is Euler's number (approx. 2.71828). In JavaScript, you access this via <code>Math.exp(-z)</code>.</li>
      </ul>
    `,
    codingTask: "Write a function <code>sigmoid(z)</code> that evaluates the sigmoid activation function and returns the value.",
    starterCode: `function sigmoid(z) {
  // TODO: Implement the Sigmoid formula 1 / (1 + e^-z)
  return 0;
}`,
    hint: "Use Math.exp(-z) to compute e^-z. Make sure your division operates on the entire denominator: 1 + Math.exp(-z).",
    solution: `function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}`,
    testCases: [
      { inputs: [0], expected: 0.5, label: "z = 0 (Expected: 0.5)" },
      { inputs: [2], expected: 0.880797, label: "z = 2 (Expected: ~0.88)" },
      { inputs: [-2], expected: 0.119202, label: "z = -2 (Expected: ~0.12)" }
    ],
    visualSettings: {
      type: "sigmoid"
    }
  },
  {
    id: 4,
    title: "Level 4: Single Neuron Classification",
    objective: "Write the forward propagation pass for a single neuron with two inputs.",
    theory: `
      <p>An artificial <strong>Neuron</strong> is the basic building block of a Neural Network. It combines multiple inputs, weighs them, adds a bias, and feeds the sum into an activation function to generate an output.</p>
      <p>For a neuron with two inputs ($x_1$, $x_2$), weights ($w_1$, $w_2$), and a bias ($b$), the calculation is:</p>
      <div class="math-block">$$z = (x_1 \\cdot w_1) + (x_2 \\cdot w_2) + b$$</div>
      <div class="math-block">$$\\text{output} = \\sigma(z)$$</div>
      <p>This output represents the probability that the inputs belong to a specific class (e.g. classification boundary separating clusters of points).</p>
    `,
    codingTask: "Write a function <code>forwardPass(x1, x2, w1, w2, bias)</code>. Calculate the weighted sum, pass it through a sigmoid activation (you can write your own or inline it), and return the final probability.",
    starterCode: `function forwardPass(x1, x2, w1, w2, bias) {
  // TODO: Calculate weighted sum z, apply sigmoid, and return result
  return 0;
}`,
    hint: "Calculate z = (x1 * w1) + (x2 * w2) + bias. Then compute sigmoid of z: 1 / (1 + Math.exp(-z)) and return it.",
    solution: `function forwardPass(x1, x2, w1, w2, bias) {
  let z = x1 * w1 + x2 * w2 + bias;
  return 1 / (1 + Math.exp(-z));
}`,
    testCases: [
      { 
        inputs: [1.0, 2.0, 0.5, -0.5, 0.1], 
        expected: 0.401312, 
        label: "x=[1,2], w=[0.5,-0.5], bias=0.1" 
      },
      { 
        inputs: [-1.0, 1.0, 2.0, 1.5, -0.5], 
        expected: 0.268941, 
        label: "x=[-1,1], w=[2,1.5], bias=-0.5" 
      }
    ],
    visualSettings: {
      type: "neuron_grid",
      dataPoints: [
        // Blue Class (x1, x2)
        { x1: 0.2, x2: 0.8, c: "blue" },
        { x1: 0.4, x2: 0.9, c: "blue" },
        { x1: 0.1, x2: 0.6, c: "blue" },
        { x1: 0.3, x2: 0.7, c: "blue" },
        // Red Class (x1, x2)
        { x1: 0.7, x2: 0.2, c: "red" },
        { x1: 0.8, x2: 0.3, c: "red" },
        { x1: 0.6, x2: 0.1, c: "red" },
        { x1: 0.9, x2: 0.4, c: "red" }
      ],
      initialParams: { w1: -2.0, w2: 2.0, bias: 0.0 }
    }
  }
];

// Export to Node/Window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LEVELS };
} else {
  window.LEVELS = LEVELS;
}
