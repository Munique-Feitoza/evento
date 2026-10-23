// Configuração Central do App de Eventos - Munique Feitoza
// URL do Google Apps Script (Web App) integrado à sua planilha do Google Drive
const CONFIG = {
  GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/AKfycbxkMw5NftADoCaJPX3_nMiZk4my-eDCXRDIS_kInrGMbJ4PtkrU5uJRZIAeghZDeGFt/exec',
  
  // Atualizar dinamicamente se necessário
  setGoogleSheetUrl: function(url) {
    if (url) {
      localStorage.setItem('munux_google_sheet_url', url.trim());
      this.GOOGLE_SHEET_URL = url.trim();
    }
  }
};
