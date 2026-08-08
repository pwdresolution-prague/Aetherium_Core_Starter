function initPasswordField(inputId, generateBtnId, toggleBtnId, fillElId, labelElId) {
    const input = document.getElementById(inputId)
    // ... zbytek stejný, jen s parametry místo pevných ID
}

// Použití v EditProfile i StudentLogin zvlášť:
initPasswordField('PasswordInputId', 'GeneratePasswordBtnId', 'TogglePasswordVisibilityId', 'StrengthBarFillId', 'StrengthLabelId')