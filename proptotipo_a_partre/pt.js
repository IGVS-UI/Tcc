// Função para alternar o menu overlay
function toggleMenu() {
    const overlay = document.getElementById('menu-overlay');
    
    if (overlay.classList.contains('active')) {
        // Fechar menu com animação
        overlay.classList.add('closing');
        
        setTimeout(() => {
            overlay.classList.remove('active');
            overlay.classList.remove('closing');
        }, 300); // Duração da animação de saída
    } else {
        // Abrir menu
        overlay.classList.add('active');
    }
}

// Fechar menu ao clicar fora do conteúdo (opcional)
document.addEventListener('DOMContentLoaded', function() {
    const menuOverlay = document.getElementById('menu-overlay');
    
    menuOverlay.addEventListener('click', function(event) {
        // Se clicou no overlay (não no conteúdo interno)
        if (event.target === menuOverlay) {
            toggleMenu();
        }
    });
});