class CircuitosQuemados extends Phaser.Scene {
  constructor() {
    super({ key: "CircuitosQuemados" });
    this.answered = false;
    this.correctOption = 1;
    this.options = [
      "Falta definir el sensorDistancia como entrada.",
      "Los motores nunca se apagan, haciendo que el dron choque constantemente.",
      "No se usa un algoritmo de toma de decisiones basado en múltiples sensores.",
      "El código necesita más delay() para funcionar correctamente.",
    ];
    this.feedbackTexts = [
      "Revisa cómo se configuran los pines en el setup().",
      "¡Correcto! Los motores deben apagarse si hay un obstáculo para evitar choques.",
      "Piensa en la lógica básica antes de usar varios sensores.",
      "El delay() no es esencial para la lógica de movimiento seguro.",
    ];
    this.solutionCode = `int sensorDistancia = A0;
int motorIzq = 9;
int motorDer = 10;
void setup() {
  pinMode(sensorDistancia, INPUT);
  pinMode(motorIzq, OUTPUT);
  pinMode(motorDer, OUTPUT);
}
void loop() {
  int distancia = analogRead(sensorDistancia);
  if (distancia > 300) {
    digitalWrite(motorIzq, HIGH);
    digitalWrite(motorDer, HIGH);
  } else {
    digitalWrite(motorIzq, LOW);
    digitalWrite(motorDer, LOW);
  }
}`;
    this.solutionBox = null;
    this.solutionBoxBg = null;
    this.continueText = null;
  }

  preload() {
    this.load.image("fondoCircuitos", "assets/rompecabezas/Taller.png");
    // Particle for background effects - use existing logo
    this.load.image("particle", "assets/logorobcodesolutions.ico");
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Enhanced background with overlay and fallback
    if (this.textures.exists("fondoCircuitos")) {
      this.add.image(centerX, centerY, "fondoCircuitos").setOrigin(0.5).setAlpha(0.6);
    } else {
      // Fallback gradient background - lighter and more modern
      const graphics = this.add.graphics();
      graphics.fillGradientStyle(0x667eea, 0x764ba2, 0x667eea, 0x764ba2, 1);
      graphics.fillRect(0, 0, 800, 600);
    }

    // Create floating particles only if texture exists
    if (this.textures.exists("particle")) {
      this.createParticles();
    }

    // Modern glassmorphism background
    this.bgPanel = this.add
      .rectangle(centerX, centerY, 920, 620, 0x1a1a2e, 0.85)
      .setOrigin(0.5);
    this.bgPanelBorder = this.add
      .rectangle(centerX, centerY, 924, 624)
      .setStrokeStyle(2, 0x00d4ff, 0.4)
      .setOrigin(0.5);

    // Animated title with gradient effect
    this.instructionTitle = this.add
      .text(
        centerX,
        45,
        "🔧 Corrección de Código Arduino",
        {
          fontSize: "26px",
          fill: "#ffffff",
          fontFamily: "Orbitron, Arial Black",
          align: "center",
          fontStyle: "bold",
          wordWrap: { width: 550 },
          stroke: "#00d4ff",
          strokeThickness: 3,
          shadow: {
            offsetX: 0,
            offsetY: 0,
            color: '#00d4ff',
            blur: 8,
            fill: true
          }
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);



    // Panel izquierdo para el código - estilo glassmorphism
    const codePanelX = centerX - 240;
    const codePanelY = centerY + 40;
    this.codePanel = this.add
      .rectangle(codePanelX, codePanelY, 440, 480, 0x0f172a, 0.9)
      .setOrigin(0.5);
    this.codePanelBorder = this.add
      .rectangle(codePanelX, codePanelY, 440, 480)
      .setStrokeStyle(2, 0x00d4ff, 0.3)
      .setOrigin(0.5);

    // Animated title for code panel
    this.codeErrorTitle = this.add
      .text(codePanelX - 200, codePanelY - 210, "🚨 Código Arduino con error:", {
        fontSize: "20px",
        fill: "#f87171",
        fontFamily: "Orbitron, Arial",
        align: "left",
        wordWrap: { width: 420 },
        fontStyle: "bold"
      })
      .setOrigin(0, 0);

    // Enhanced code display with syntax highlighting effect
    const codeWithError = `int sensorDistancia = A0;
int motorIzq = 9;
int motorDer = 10;

void setup() {
  pinMode(motorIzq, OUTPUT);
  pinMode(motorDer, OUTPUT);
}

void loop() {
  int distancia = analogRead(sensorDistancia);
  if (distancia > 300) {
    digitalWrite(motorIzq, HIGH);
    digitalWrite(motorDer, HIGH);
  }
}`;

    this.codeErrorText = this.add
      .text(codePanelX - 200, codePanelY - 180, codeWithError, {
        fontSize: "18px",
        fill: "#7dd3fc",
        fontFamily: "'Courier New', monospace",
        align: "left",
        wordWrap: { width: 420 },
        lineSpacing: 6,
        padding: { x: 20, y: 15 },
        backgroundColor: '#0f172a',
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: '#00d4ff',
          blur: 5,
          fill: true
        }
      })
      .setOrigin(0, 0);

    // Panel derecho para pregunta y opciones - estilo glassmorphism
    const optionsPanelX = centerX + 220;
    const optionsPanelY = centerY + 40;
    this.optionsPanel = this.add
      .rectangle(optionsPanelX, optionsPanelY, 400, 340, 0x1e293b, 0.6)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x475569, 0.3);

    // Enhanced question with modern styling
    this.optionsQuestion = this.add
      .text(
        optionsPanelX,
        optionsPanelY - 120,
        "🤔 ¿Cuál es el error en este código?",
        {
          fontSize: "22px",
          fill: "#ffffff",
          fontFamily: "Inter, Arial",
          align: "center",
          wordWrap: { width: 380 },
          fontStyle: "bold",
          shadow: {
            offsetX: 0,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            fill: true
          }
        }
      )
      .setOrigin(0.5);

    // Modern glassmorphism options
    this.optionButtons = [];
    this.optionButtonGraphics = [];
    for (let i = 0; i < this.options.length; i++) {
      const y = optionsPanelY - 60 + i * 55;

      // Create container for each option
      const container = this.add.container(optionsPanelX, y);

      // Modern button with glass effect
      const button = this.add
        .rectangle(0, 0, 370, 44, 0x334155, 0.8)
        .setStrokeStyle(2, 0x475569, 0.6)
        .setInteractive({ useHandCursor: true });

      const text = this.add
        .text(
          0,
          0,
          `(${String.fromCharCode(65 + i)}) ${this.options[i]}`,
          {
            fontSize: "16px",
            fill: "#e2e8f0",
            fontFamily: "Inter, Arial",
            align: "center",
            wordWrap: { width: 340 },
            lineSpacing: 2
          }
        )
        .setOrigin(0.5);

      container.add([button, text]);

      // Enhanced hover effects
      button.on("pointerover", () => {
        if (!button.getData("disabled")) {
          this.tweens.add({
            targets: [button, text],
            scaleX: 1.02,
            scaleY: 1.05,
            duration: 200,
            ease: 'Power2'
          });
          button.setFillStyle(0x475569, 0.9);
          button.setStrokeStyle(2, 0x00d4ff, 1);
        }
      });

      button.on("pointerout", () => {
        if (!button.getData("disabled")) {
          this.tweens.add({
            targets: [button, text],
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2'
          });
          button.setFillStyle(0x334155, 0.8);
          button.setStrokeStyle(2, 0x475569, 0.6);
        }
      });

      button.setData("disabled", false);
      button.on("pointerdown", () => this.handleAnswer(i));

      // Staggered animation on load
      container.setAlpha(0);
      this.tweens.add({
        targets: container,
        alpha: 1,
        delay: i * 100,
        duration: 600,
        ease: 'Power2'
      });

      this.optionButtons.push({ button, text, container });
      this.optionButtonGraphics.push(button);
    }

    // Feedback y solución (abajo, centrados)
    this.feedback = this.add
      .text(centerX, centerY + 320, "", {
        fontSize: "20px",
        fill: "#3a506b",
        fontFamily: "Arial Black",
        align: "center",
        wordWrap: { width: 800 },
      })
      .setOrigin(0.5);
    this.solutionBox = null;
    this.solutionBoxBg = null;
    this.continueText = null;
  }

  clearAllExceptBackground() {
    [
      this.instructionTitle,
      this.bgPanel,
      this.bgPanelBorder,
      this.codePanel,
      this.codePanelBorder,
      this.codeErrorTitle,
      this.codeErrorText,
      this.optionsPanel,
      this.optionsQuestion,
      this.feedback,
      ...this.optionButtons.map((o) => o.button),
      ...this.optionButtons.map((o) => o.text),
    ].forEach((obj) => obj && obj.destroy());
  }

  createParticles() {
    // Use existing logo as particle since particle texture might not exist
    if (this.textures.exists('particle')) {
      const particles = this.add.particles(0, 0, 'particle', {
        x: { min: 0, max: 800 },
        y: { min: 0, max: 600 },
        scale: { start: 0.2, end: 0.1 },
        alpha: { start: 0.3, end: 0 },
        speed: 20,
        lifespan: 4000,
        frequency: 500,
        tint: 0x00d4ff
      });
      particles.setDepth(-1);
    }
  }

  handleAnswer(selectedIndex) {
    if (this.answered) return;

    // Disable all buttons with smooth animation
    this.optionButtonGraphics.forEach((btn, i) => {
      btn.setData("disabled", true);
      btn.disableInteractive();
      if (i !== selectedIndex) {
        this.tweens.add({
          targets: this.optionButtons[i].container,
          alpha: 0.4,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    const isCorrect = selectedIndex === this.correctOption;
    const { button, container } = this.optionButtons[selectedIndex];

    if (isCorrect) {
      this.answered = true;

      // Success glow effect
      const glow = this.add.circle(container.x, container.y, 150, 0x00ff00, 0.2);
      this.tweens.add({
        targets: glow,
        alpha: 0,
        scale: 2,
        duration: 800,
        ease: 'Power2'
      });

      // Success animation
      this.tweens.add({
        targets: [button, this.optionButtons[selectedIndex].text],
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 300,
        yoyo: true,
        ease: 'Back'
      });

      button.setFillStyle(0x00ff00, 0.9);
      button.setStrokeStyle(2, 0x00ff00, 1);

      // Enhanced success transition
      this.time.delayedCall(800, () => {
        this.clearAllExceptBackground();
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Modern success panel
        this.solutionBoxBg = this.add.graphics();
        this.solutionBoxBg.fillStyle(0x1a1a1a, 0.95);
        this.solutionBoxBg.fillRoundedRect(
          centerX - 400,
          centerY - 200,
          800,
          420,
          24
        );
        this.solutionBoxBg.lineStyle(2, 0x00ff00, 0.5);
        this.solutionBoxBg.strokeRoundedRect(
          centerX - 400,
          centerY - 200,
          800,
          420,
          24
        );

        // Enhanced title
        this.solutionTitle = this.add
          .text(centerX, centerY - 190, "¡Código Correcto!", {
            fontSize: "28px",
            fill: "#00ff00",
            fontFamily: "Inter, Arial",
            align: "center",
            fontStyle: "bold"
          })
          .setOrigin(0.5);

        // Enhanced code display
        this.solutionBox = this.add
          .text(centerX, centerY - 10, this.solutionCode, {
            fontSize: "16px",
            fill: "#ffffff",
            fontFamily: "Fira Code, Courier New",
            align: "left",
            wordWrap: { width: 740 },
            padding: { x: 15, y: 15 },
            lineSpacing: 4
          })
          .setOrigin(0.5, 0.5);

        // Enhanced continue message
        this.continueText = this.add
          .text(centerX, centerY + 170, "👉 Haz click para continuar", {
            fontSize: "26px",
            fill: "#00d4ff",
            fontFamily: "Inter, Arial",
            align: "center",
            fontStyle: "bold"
          })
          .setOrigin(0.5);

        this.tweens.add({
          targets: this.continueText,
          alpha: 0.4,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine'
        });

        // Smooth transition
        this.input.once("pointerdown", () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.time.delayedCall(500, () => {
            this.scene.start("ArduinoGameScene");
          });
        });
      });

    } else {
      // Enhanced wrong answer feedback
      button.setFillStyle(0xff4757, 0.9);
      button.setStrokeStyle(2, 0xff4757, 1);

      // Enhanced shake animation
      this.tweens.add({
        targets: container,
        x: container.x - 8,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });

      // Error feedback
      this.feedback.setText(this.feedbackTexts[selectedIndex]);
      this.feedback.setStyle({
        fill: "#ff4757",
        fontSize: "22px",
        fontStyle: "bold",
        shadow: {
          offsetX: 0,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          fill: true
        }
      });

      // Reset after feedback
      this.time.delayedCall(2500, () => {
        this.scene.restart();
      });
    }
  }
}
