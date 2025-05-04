const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Iniciando instalação do Sogrinha Desktop...');

// Verifica se o Node.js está instalado
try {
    const nodeVersion = execSync('node -v').toString().trim();
    console.log(`Node.js versão ${nodeVersion} encontrado`);
} catch (error) {
    console.error('Node.js não encontrado. Por favor, instale o Node.js primeiro.');
    process.exit(1);
}

// Instala dependências do projeto principal
console.log('\nInstalando dependências principais...');
try {
    execSync('npm install', { stdio: 'inherit' });
} catch (error) {
    console.error('Erro ao instalar dependências principais:', error);
    process.exit(1);
}

// Instala dependências do frontend
console.log('\nInstalando dependências do frontend...');
try {
    execSync('cd frontend && npm install', { stdio: 'inherit' });
} catch (error) {
    console.error('Erro ao instalar dependências do frontend:', error);
    process.exit(1);
}

// Cria diretório para logs se não existir
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
    console.log('\nDiretório de logs criado');
}

console.log('\nInstalação concluída com sucesso!');
console.log('\nPara iniciar o aplicativo em modo desenvolvimento:');
console.log('npm run electron-dev');
console.log('\nPara criar um instalador para Windows:');
console.log('npm run electron-pack'); 
