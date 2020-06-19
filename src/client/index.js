import { updateUI, clickBtn, returnSubmit } from "./js/app.js"

import './styles/style.scss'

// main function once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate');
    const feelingsBox = document.getElementById("feelings");

    updateUI();
    clickBtn(generateBtn);
    returnSubmit(feelingsBox);
})

export {
    updateUI,
    clickBtn,
    returnSubmit
}