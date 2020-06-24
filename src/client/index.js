import { updateUI, clickBtn, detectDate } from "./js/app.js"

import './styles/style.scss'

// main function once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate');
    const feelingsBox = document.getElementById("feelings");
    const startDateItem = document.getElementById('postStartDate')

    updateUI();
    clickBtn(generateBtn);
    detectDate(startDateItem)
})

export {
    updateUI,
    clickBtn,
    detectDate
}