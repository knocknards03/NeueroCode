// NeuroCode: Interactive ML Coding Lab — App Controller

document.addEventListener("DOMContentLoaded", () => {
  // --- STATE ---
  const state = {
    currentLevelIdx: 0,
    levelCompleted: {},
    editorValue: "",
    params: { w: 0.5, b: 0, w1: -1, w2: 1, bias: 0, targetW: 1.8, targetB: 0.6, learningRate: 0.1 },
    simulationActive: false,
    animationFrameId: null,
    // Descent simulation state
    descentPoint: { w: -1.5, b: -1.0 }
  };

  // --- DOM REFERENCES ---
  const el = {
    levelsList: document.getElementById("levels-list"),
    lessonTitle: document.getElementById("lesson-title"),
    lessonTheory: document.getElementById("lesson-theory"),
    taskText: document.getElementById("task-text"),
    
    // Editor & Console
    editorTextarea: document.getElementById("editor-textarea"),
    runBtn: document.getElementById("run-btn"),
    resetBtn: document.getElementById("reset-btn"),
    solutionBtn: document.getElementById("solution-btn"),
    hintBtn: document.getElementById("hint-btn"),
    consoleBody: document.getElementById("console-body"),
    
    // Visualizer
    canvas: document.getElementById("visualizer-canvas"),
    paramSliders: document.getElementById("param-sliders"),
    successSplash: document.getElementById("success-splash"),
    nextLevelBtn: document.getElementById("next-level-btn")
  };

  const ctx = el.canvas.getContext("2d");

  // --- INITIALIZATION ---
  function init() {
    loadProgress();
    buildLevelsSidebar();
    loadLevel(0);
    setupEvents();
    startAnimationLoop();
  }

  // --- STORAGE ---
  function loadProgress() {
    try {
      const saved = localStorage.getItem("neurocode_completed_levels");
      if (saved) state.levelCompleted = JSON.parse(saved);
    } catch (e) {
      console.error("Error loading progress", e);
    }
  }

  function saveProgress(levelId) {
    try {
      state.levelCompleted[levelId] = true;
      localStorage.setItem("neurocode_completed_levels", JSON.stringify(state.levelCompleted));
      updateLevelsSidebar();
    } catch (e) {
      console.error("Error saving progress", e);
    }
  }

  // --- SIDEBAR BUILDER ---
  function buildLevelsSidebar() {
    if (!el.levelsList) return;
    el.levelsList.innerHTML = "";

    window.LEVELS.forEach((level, idx) => {
      const item = document.createElement("li");
      item.className = "level-item";
      
      const isCompleted = state.levelCompleted[level.id];
      const statusText = isCompleted ? "COMPLETED" : "UNSOLVED";

      item.innerHTML = `
        <button class="level-btn" id="level-btn-${level.id}" data-idx="${idx}">
          <span>${level.title}</span>
          <span class="status-badge">${statusText}</span>
        </button>
      `;

      item.querySelector(".level-btn").onclick = () => {
        loadLevel(idx);
      };

      el.levelsList.appendChild(item);
    });

    updateLevelsSidebar();
  }

  function updateLevelsSidebar() {
    window.LEVELS.forEach(level => {
      const btn = document.getElementById(`level-btn-${level.id}`);
      if (!btn) return;

      const idx = parseInt(btn.getAttribute("data-idx"));
      if (idx === state.currentLevelIdx) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }

      if (state.levelCompleted[level.id]) {
        btn.classList.add("completed");
        btn.querySelector(".status-badge").textContent = "COMPLETED";
      } else {
        btn.classList.remove("completed");
        btn.querySelector(".status-badge").textContent = "UNSOLVED";
      }
    });
  }

  // --- LOAD LEVEL ---
  function loadLevel(idx) {
    state.currentLevelIdx = idx;
    const lvl = window.LEVELS[idx];
    if (!lvl) return;

    // Reset simulation state
    state.simulationActive = false;
    if (lvl.id === 2) {
      state.descentPoint.w = lvl.visualSettings.initialParams.w;
      state.descentPoint.b = lvl.visualSettings.initialParams.b;
    }

    // Load instructions
    el.lessonTitle.textContent = lvl.title;
    el.lessonTheory.innerHTML = lvl.theory;
    el.taskText.innerHTML = lvl.codingTask;

    // Set code editor values
    const savedCode = localStorage.getItem(`neurocode_code_lvl_${lvl.id}`);
    state.editorValue = savedCode || lvl.starterCode;
    el.editorTextarea.value = state.editorValue;

    // Load Sliders UI
    buildSliders(lvl);

    // Hide success splash
    el.successSplash.style.display = "none";

    // Update Sidebar
    updateLevelsSidebar();

    // Log initialization to Console
    clearConsole();
    logConsole("Initializing terminal connection...", "info");
    logConsole(`Level ${lvl.id} loaded successfully. Write function and click [Run Code].`, "info");
  }

  function buildSliders(lvl) {
    if (!el.paramSliders) return;
    el.paramSliders.innerHTML = "";

    let slidersMarkup = '<div class="param-title">Interactive Params</div>';

    if (lvl.id === 1) {
      slidersMarkup += `
        <div class="slider-group">
          <div class="slider-labels">
            <span>Weight (w)</span>
            <span id="slider-val-w">${state.params.w}</span>
          </div>
          <input type="range" class="slider-input" id="slider-w" min="-3" max="3" step="0.1" value="${state.params.w}">
        </div>
        <div class="slider-group">
          <div class="slider-labels">
            <span>Bias (b)</span>
            <span id="slider-val-b">${state.params.b}</span>
          </div>
          <input type="range" class="slider-input" id="slider-b" min="-3" max="3" step="0.1" value="${state.params.b}">
        </div>
      `;
    } else if (lvl.id === 2) {
      slidersMarkup += `
        <div class="slider-group">
          <div class="slider-labels">
            <span>Learning Rate (alpha)</span>
            <span id="slider-val-lr">${state.params.learningRate}</span>
          </div>
          <input type="range" class="slider-input" id="slider-lr" min="0.01" max="0.5" step="0.01" value="${state.params.learningRate}">
        </div>
      `;
    } else if (lvl.id === 3) {
      slidersMarkup += `
        <div class="slider-group">
          <div class="slider-labels">
            <span>Input (z)</span>
            <span id="slider-val-z">0.0</span>
          </div>
          <input type="range" class="slider-input" id="slider-z" min="-6" max="6" step="0.1" value="0">
        </div>
      `;
    } else if (lvl.id === 4) {
      slidersMarkup += `
        <div class="slider-group">
          <div class="slider-labels">
            <span>Weight 1 (w1)</span>
            <span id="slider-val-w1">${state.params.w1}</span>
          </div>
          <input type="range" class="slider-input" id="slider-w1" min="-5" max="5" step="0.1" value="${state.params.w1}">
        </div>
        <div class="slider-group">
          <div class="slider-labels">
            <span>Weight 2 (w2)</span>
            <span id="slider-val-w2">${state.params.w2}</span>
          </div>
          <input type="range" class="slider-input" id="slider-w2" min="-5" max="5" step="0.1" value="${state.params.w2}">
        </div>
        <div class="slider-group">
          <div class="slider-labels">
            <span>Bias (b)</span>
            <span id="slider-val-bias">${state.params.bias}</span>
          </div>
          <input type="range" class="slider-input" id="slider-bias" min="-5" max="5" step="0.1" value="${state.params.bias}">
        </div>
      `;
    }

    el.paramSliders.innerHTML = slidersMarkup;

    // Attach listeners to newly created sliders
    if (lvl.id === 1) {
      const sw = document.getElementById("slider-w");
      const sb = document.getElementById("slider-b");
      sw.oninput = (e) => {
        state.params.w = parseFloat(e.target.value);
        document.getElementById("slider-val-w").textContent = state.params.w.toFixed(1);
      };
      sb.oninput = (e) => {
        state.params.b = parseFloat(e.target.value);
        document.getElementById("slider-val-b").textContent = state.params.b.toFixed(1);
      };
    } else if (lvl.id === 2) {
      const slr = document.getElementById("slider-lr");
      slr.oninput = (e) => {
        state.params.learningRate = parseFloat(e.target.value);
        document.getElementById("slider-val-lr").textContent = state.params.learningRate.toFixed(2);
      };
    } else if (lvl.id === 3) {
      const sz = document.getElementById("slider-z");
      sz.oninput = (e) => {
        state.params.z = parseFloat(e.target.value);
        document.getElementById("slider-val-z").textContent = state.params.z.toFixed(1);
      };
      state.params.z = 0.0;
    } else if (lvl.id === 4) {
      const sw1 = document.getElementById("slider-w1");
      const sw2 = document.getElementById("slider-w2");
      const sbias = document.getElementById("slider-bias");
      sw1.oninput = (e) => {
        state.params.w1 = parseFloat(e.target.value);
        document.getElementById("slider-val-w1").textContent = state.params.w1.toFixed(1);
      };
      sw2.oninput = (e) => {
        state.params.w2 = parseFloat(e.target.value);
        document.getElementById("slider-val-w2").textContent = state.params.w2.toFixed(1);
      };
      sbias.oninput = (e) => {
        state.params.bias = parseFloat(e.target.value);
        document.getElementById("slider-val-bias").textContent = state.params.bias.toFixed(1);
      };
    }
  }

  // --- EVENTS BINDING ---
  function setupEvents() {
    el.editorTextarea.oninput = (e) => {
      state.editorValue = e.target.value;
      const lvl = window.LEVELS[state.currentLevelIdx];
      localStorage.setItem(`neurocode_code_lvl_${lvl.id}`, state.editorValue);
    };

    el.runBtn.onclick = () => {
      runUserCode();
    };

    el.resetBtn.onclick = () => {
      const lvl = window.LEVELS[state.currentLevelIdx];
      if (confirm("Reset editor to starter code template? All edits on this level will be cleared.")) {
        state.editorValue = lvl.starterCode;
        el.editorTextarea.value = state.editorValue;
        localStorage.removeItem(`neurocode_code_lvl_${lvl.id}`);
        logConsole("Editor reset to starter template.", "warn");
      }
    };

    el.solutionBtn.onclick = () => {
      const lvl = window.LEVELS[state.currentLevelIdx];
      if (confirm("Reveal reference solution code? This will overwrite your current editor content.")) {
        state.editorValue = lvl.solution;
        el.editorTextarea.value = state.editorValue;
        localStorage.setItem(`neurocode_code_lvl_${lvl.id}`, state.editorValue);
        logConsole("Reference solution loaded into editor.", "info");
      }
    };

    el.hintBtn.onclick = () => {
      const lvl = window.LEVELS[state.currentLevelIdx];
      alert(`[Hint]: ${lvl.hint}`);
    };

    el.nextLevelBtn.onclick = () => {
      if (state.currentLevelIdx < window.LEVELS.length - 1) {
        loadLevel(state.currentLevelIdx + 1);
      } else {
        alert("Congratulations! You have completed all levels in the NeuroCode ML Lab!");
      }
    };
  }

  // --- CONSOLE LOGGER ---
  function clearConsole() {
    if (el.consoleBody) el.consoleBody.innerHTML = "";
  }

  function logConsole(text, type = "info") {
    if (!el.consoleBody) return;
    const line = document.createElement("div");
    line.className = `console-line ${type}`;
    
    let prefix = "❯ ";
    if (type === "success") prefix = "✔ [PASS] ";
    if (type === "error") prefix = "✘ [FAIL] ";
    if (type === "warn") prefix = "⚠ [WARN] ";
    
    line.textContent = `${prefix}${text}`;
    el.consoleBody.appendChild(line);
    el.consoleBody.scrollTop = el.consoleBody.scrollHeight;
  }

  // --- COMPILER & RUNNER ---
  function runUserCode() {
    const lvl = window.LEVELS[state.currentLevelIdx];
    const code = el.editorTextarea.value;
    
    clearConsole();
    logConsole("Compiling user syntax...", "info");

    let expectedFuncName = "";
    if (lvl.id === 1) expectedFuncName = "predict";
    if (lvl.id === 2) expectedFuncName = "updateParameters";
    if (lvl.id === 3) expectedFuncName = "sigmoid";
    if (lvl.id === 4) expectedFuncName = "forwardPass";

    let userFunc = null;
    try {
      // Create execution environment
      let compile = new Function(`
        ${code};
        if (typeof ${expectedFuncName} === 'undefined') {
          throw new Error('Function "${expectedFuncName}" is not defined.');
        }
        return ${expectedFuncName};
      `);
      userFunc = compile();
      logConsole("Compilation successful. Running unit test assertions...", "info");
    } catch (err) {
      logConsole(err.message, "error");
      return;
    }

    // Run tests
    let allPassed = true;
    lvl.testCases.forEach((tc, index) => {
      try {
        const actual = userFunc(...tc.inputs);
        let match = false;

        if (typeof tc.expected === "object") {
          // Compare objects (Level 2)
          match = Math.abs(actual.w - tc.expected.w) < 1e-4 && Math.abs(actual.b - tc.expected.b) < 1e-4;
        } else {
          // Compare floating values
          match = Math.abs(actual - tc.expected) < 1e-4;
        }

        if (match) {
          logConsole(`Test ${index + 1} Passed: ${tc.label}`, "success");
        } else {
          allPassed = false;
          let expectedStr = typeof tc.expected === "object" ? JSON.stringify(tc.expected) : tc.expected.toFixed(4);
          let actualStr = typeof actual === "object" ? JSON.stringify(actual) : (typeof actual === "number" ? actual.toFixed(4) : actual);
          logConsole(`Test ${index + 1} Failed: ${tc.label}. Expected ${expectedStr}, got ${actualStr}`, "error");
        }
      } catch (err) {
        allPassed = false;
        logConsole(`Test ${index + 1} Exception: ${err.message}`, "error");
      }
    });

    if (allPassed) {
      logConsole("ALL TESTS SUCCESSFUL! Learning completed.", "success");
      saveProgress(lvl.id);
      
      // Reveal success panel
      el.successSplash.style.display = "block";
      
      // Trigger dynamic level animations
      state.simulationActive = true;
      if (lvl.id === 2) {
        // Run descent optimization loop
        triggerDescentSimulation(userFunc);
      }
    } else {
      logConsole("Optimization failed. Re-evaluate formulas and update rules.", "error");
    }
  }

  // --- GRADIENT DESCENT OPT LOOP SIMULATION ---
  function triggerDescentSimulation(userUpdateFunc) {
    const lvl = window.LEVELS[1];
    state.descentPoint.w = lvl.visualSettings.initialParams.w;
    state.descentPoint.b = lvl.visualSettings.initialParams.b;
    
    let step = 0;
    const maxSteps = 150;

    function runStep() {
      if (!state.simulationActive || step >= maxSteps) return;

      const targetW = state.params.targetW;
      const targetB = state.params.targetB;
      const lr = state.params.learningRate;

      // Compute gradients (simple quadratic loss: L = (w - targetW)^2 + (b - targetB)^2)
      // dw = 2 * (w - targetW)
      // db = 2 * (b - targetB)
      const dw = 2 * (state.descentPoint.w - targetW);
      const db = 2 * (state.descentPoint.b - targetB);

      // Invoke user compiled function
      try {
        const next = userUpdateFunc(state.descentPoint.w, state.descentPoint.b, dw, db, lr);
        state.descentPoint.w = next.w;
        state.descentPoint.b = next.b;
      } catch (e) {
        state.simulationActive = false;
        return;
      }

      step++;
      setTimeout(runStep, 40); // 25 fps updates
    }

    runStep();
  }

  // --- CANVAS RENDERING ENGINE (60 FPS) ---
  function startAnimationLoop() {
    function tick() {
      drawVisualizer();
      state.animationFrameId = requestAnimationFrame(tick);
    }
    tick();
  }

  function drawVisualizer() {
    const w = el.canvas.width = el.canvas.clientWidth;
    const h = el.canvas.height = el.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const lvl = window.LEVELS[state.currentLevelIdx];
    if (!lvl) return;

    if (lvl.id === 1) {
      drawLevel1Linear(w, h);
    } else if (lvl.id === 2) {
      drawLevel2Descent(w, h);
    } else if (lvl.id === 3) {
      drawLevel3Sigmoid(w, h);
    } else if (lvl.id === 4) {
      drawLevel4NeuronGrid(w, h);
    }
  }

  // --- LEVEL 1: LINEAR FITTER ---
  function drawLevel1Linear(w, h) {
    const lvl = window.LEVELS[0];
    
    // Draw grid axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Origin coords
    const cx = w / 2;
    const cy = h / 2;
    const scale = 30; // 30px per unit

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    // Plot target points
    lvl.visualSettings.dataPoints.forEach(pt => {
      const px = cx + pt.x * scale;
      const py = cy - pt.y * scale;

      ctx.fillStyle = "var(--purple)";
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = "var(--purple-glow)";
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; // Reset
    });

    // Draw prediction line (w * x + b)
    const currentW = state.params.w;
    const currentB = state.params.b;

    ctx.strokeStyle = "var(--cyan)";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "var(--cyan-glow)";
    
    ctx.beginPath();
    for (let screenX = 0; screenX < w; screenX++) {
      const xVal = (screenX - cx) / scale;
      const yVal = currentW * xVal + currentB;
      const screenY = cy - yVal * scale;
      
      if (screenX === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset
  }

  // --- LEVEL 2: GRADIENT DESCENT VALLEY ---
  function drawLevel2Descent(w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const targetW = state.params.targetW;
    const targetB = state.params.targetB;

    // Draw Loss function concentric circles (contour graph)
    ctx.lineWidth = 1.5;
    for (let r = 25; r < 200; r += 25) {
      ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0.02, 0.2 - r / 1000)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Loss Valley Center (Minimum point)
    ctx.fillStyle = "var(--green)";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "var(--green-glow)";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Map weight, bias parameters space to screen
    // Let center (cx, cy) represent (targetW, targetB)
    const scale = 50; 
    const mapToScreen = (wVal, bVal) => {
      return {
        x: cx + (wVal - targetW) * scale,
        y: cy + (bVal - targetB) * scale
      };
    };

    const pt = mapToScreen(state.descentPoint.w, state.descentPoint.b);

    // Draw path line from start to target
    ctx.strokeStyle = "rgba(189, 94, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // Draw current parameter coordinates dot
    ctx.fillStyle = "var(--purple)";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "var(--purple-glow)";
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Info Text
    ctx.fillStyle = "var(--text-dim)";
    ctx.font = "10px 'Space Mono'";
    ctx.fillText(`Params: w = ${state.descentPoint.w.toFixed(2)}, b = ${state.descentPoint.b.toFixed(2)}`, 16, 24);
  }

  // --- LEVEL 3: SIGMOID SQUASHER ---
  function drawLevel3Sigmoid(w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const scaleX = w / 12; // -6 to 6
    const scaleY = h / 2.5; // range 0 to 1

    // Draw axes
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1.5;
    // Y Axis at 0
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    // X Axis at 0.5 probability (vertical middle)
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    // Draw Sigmoid curve
    ctx.strokeStyle = "var(--cyan)";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "var(--cyan-glow)";
    ctx.beginPath();

    for (let screenX = 0; screenX < w; screenX++) {
      const z = (screenX - cx) / scaleX;
      // sigmoid formula
      const sig = 1 / (1 + Math.exp(-z));
      // Map probability 0 to 1 onto screen height
      const screenY = h - (sig * scaleY + (h - scaleY) / 2);
      
      if (screenX === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Plot interactive z input dot
    const currentZ = state.params.z;
    const currentSig = 1 / (1 + Math.exp(-currentZ));

    const ptX = cx + currentZ * scaleX;
    const ptY = h - (currentSig * scaleY + (h - scaleY) / 2);

    ctx.fillStyle = "var(--purple)";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "var(--purple-glow)";
    ctx.beginPath();
    ctx.arc(ptX, ptY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Coordinates overlay text
    ctx.fillStyle = "#fff";
    ctx.font = "10px 'Space Mono'";
    ctx.fillText(`z = ${currentZ.toFixed(1)}`, ptX - 15, ptY - 14);
    ctx.fillText(`P(y=1) = ${currentSig.toFixed(3)}`, 16, 24);
  }

  // --- LEVEL 4: 2D NEURON DECISION GRID ---
  function drawLevel4NeuronGrid(w, h) {
    const lvl = window.LEVELS[3];

    const currentW1 = state.params.w1;
    const currentW2 = state.params.w2;
    const currentBias = state.params.bias;

    // Render shaded classification regions pixel-by-pixel (coarse grid for performance)
    const gridSize = 4;
    for (let px = 0; px < w; px += gridSize) {
      for (let py = 0; py < h; py += gridSize) {
        // Map screen coords (0 to w) to features space (0.0 to 1.0)
        const x1 = px / w;
        const x2 = 1.0 - (py / h); // Invert Y

        // Evaluate neuron forward pass
        const z = x1 * currentW1 + x2 * currentW2 + currentBias;
        const probability = 1 / (1 + Math.exp(-z));

        // Color mix based on output probability: P > 0.5 (blueish), P <= 0.5 (redish)
        // Shading intensity matches probability confidence
        let rColor, gColor, bColor;
        if (probability > 0.5) {
          // Blueish region
          const alpha = (probability - 0.5) * 0.4; // cap opacity
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        } else {
          // Redish region
          const alpha = (0.5 - probability) * 0.4;
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        }
        ctx.fillRect(px, py, gridSize, gridSize);
      }
    }

    // Draw decision boundary line: z = 0 -> x1*w1 + x2*w2 + bias = 0 -> x2 = (-w1/w2)*x1 - bias/w2
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < w; px++) {
      const x1 = px / w;
      const x2 = (-currentW1 / currentW2) * x1 - (currentBias / currentW2);
      const py = (1.0 - x2) * h;
      
      if (px === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Plot scatter points
    lvl.visualSettings.dataPoints.forEach(pt => {
      const px = pt.x1 * w;
      const py = (1.0 - pt.x2) * h;

      ctx.fillStyle = pt.c === "blue" ? "var(--cyan)" : "var(--coral)";
      ctx.shadowBlur = 8;
      ctx.shadowColor = pt.c === "blue" ? "var(--cyan-glow)" : "var(--coral-glow)";
      
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // --- RUN APP ---
  init();
});
