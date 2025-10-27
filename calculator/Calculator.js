
        let display = document.getElementById("display");

        function press(value) {
            display.value += value;
        }

        function clearDisplay() {
            display.value = "";
        }

        function backspace() {
            display.value = display.value.slice(0, -1);
        }

        function calculate() {
            try {
                display.value = eval(display.value);
            } catch (e) {
                display.value = "Error";
            }
        }

        //  Keyboard support: Enter = calculate()
        display.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // stop form submission (if any)
                calculate();
            }
        });
