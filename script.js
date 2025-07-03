class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        if (this.currentOperand === 'Error') {
            this.clear();
        }

        if (number === '.' && this.currentOperand.includes('.')) return;

        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }

        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError();
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }

        // Handle very large or very small numbers
        if (!isFinite(computation)) {
            this.showError();
            return;
        }

        // Round to prevent floating point errors
        computation = Math.round(computation * 100000000) / 100000000;

        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    showError() {
        this.currentOperand = 'Error';
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;

        // Add shake animation
        const display = document.getElementById('display');
        display.classList.add('error');
        setTimeout(() => {
            display.classList.remove('error');
        }, 500);
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        if (this.currentOperand === 'Error') {
            this.currentOperandElement.innerText = 'Error';
        } else {
            this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand) || '0';
        }

        if (this.operation != null) {
            this.previousOperandElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', function() {
    const previousOperandElement = document.getElementById('previousOperand');
    const currentOperandElement = document.getElementById('currentOperand');

    const calculator = new Calculator(previousOperandElement, currentOperandElement);

    // Button event listeners
    const numberButtons = document.querySelectorAll('[data-number]');
    const operationButtons = document.querySelectorAll('[data-operation]');
    const equalsButton = document.querySelector('[data-equals]');
    const deleteButton = document.querySelector('[data-delete]');
    const clearButton = document.querySelector('[data-clear]');

    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.appendNumber(button.innerText);
            calculator.updateDisplay();
            animateButton(button);
        });
    });

    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.innerText);
            calculator.updateDisplay();
            animateButton(button);
            highlightOperator(button);
        });
    });

    equalsButton.addEventListener('click', () => {
        calculator.compute();
        calculator.updateDisplay();
        animateButton(equalsButton);
        clearOperatorHighlight();
    });

    clearButton.addEventListener('click', () => {
        calculator.clear();
        calculator.updateDisplay();
        animateButton(clearButton);
        clearOperatorHighlight();
    });

    deleteButton.addEventListener('click', () => {
        calculator.delete();
        calculator.updateDisplay();
        animateButton(deleteButton);
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key;

        // Prevent default behavior for calculator keys
        if ('0123456789.+-*/=%'.includes(key) || key === 'Enter' || key === 'Backspace' || key === 'Delete' || key === 'Escape') {
            e.preventDefault();
        }

        if ('0123456789'.includes(key)) {
            calculator.appendNumber(key);
            calculator.updateDisplay();
            highlightKeyboardButton(key);
        }

        if (key === '.') {
            calculator.appendNumber(key);
            calculator.updateDisplay();
            highlightKeyboardButton(key);
        }

        if (key === '+') {
            calculator.chooseOperation('+');
            calculator.updateDisplay();
            highlightKeyboardButton('+');
        }

        if (key === '-') {
            calculator.chooseOperation('-');
            calculator.updateDisplay();
            highlightKeyboardButton('-');
        }

        if (key === '*') {
            calculator.chooseOperation('×');
            calculator.updateDisplay();
            highlightKeyboardButton('×');
        }

        if (key === '/') {
            calculator.chooseOperation('÷');
            calculator.updateDisplay();
            highlightKeyboardButton('÷');
        }

        if (key === '%') {
            calculator.chooseOperation('%');
            calculator.updateDisplay();
            highlightKeyboardButton('%');
        }

        if (key === 'Enter' || key === '=') {
            calculator.compute();
            calculator.updateDisplay();
            highlightKeyboardButton('=');
            clearOperatorHighlight();
        }

        if (key === 'Backspace') {
            calculator.delete();
            calculator.updateDisplay();
            highlightKeyboardButton('⌫');
        }

        if (key === 'Escape' || key === 'Delete') {
            calculator.clear();
            calculator.updateDisplay();
            highlightKeyboardButton('AC');
            clearOperatorHighlight();
        }
    });

    // Animation functions
    function animateButton(button) {
        button.classList.add('animate');
        setTimeout(() => {
            button.classList.remove('animate');
        }, 100);
    }

    function highlightOperator(button) {
        clearOperatorHighlight();
        button.classList.add('active');
    }

    function clearOperatorHighlight() {
        operationButtons.forEach(button => {
            button.classList.remove('active');
        });
    }

    function highlightKeyboardButton(key) {
        const button = findButtonByText(key);
        if (button) {
            button.classList.add('pressed');
            setTimeout(() => {
                button.classList.remove('pressed');
            }, 150);
        }
    }

    function findButtonByText(text) {
        const allButtons = document.querySelectorAll('.btn');
        return Array.from(allButtons).find(button => button.innerText === text);
    }

    // Initialize display
    calculator.updateDisplay();
});