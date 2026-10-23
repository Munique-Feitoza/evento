// Configuração Central do App de Eventos - Munique Feitoza
// Cole aqui a URL do seu Google Apps Script (Web App)
const CONFIG = {
  // Exemplo: 'https://script.google.com/macros/s/AKfycbx.../exec'
  GOOGLE_SHEET_URL: localStorage.getItem('munux_google_sheet_url') || '',
  
  // Salvar nova URL do Google Sheets
  setGoogleSheetUrl: function(url) {
    if (url) {
      localStorage.setItem('munux_google_sheet_url', url.trim());
      this.GOOGLE_SHEET_URL = url.trim();
    }
  }
};
