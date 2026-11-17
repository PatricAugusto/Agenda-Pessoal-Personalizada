# Agenda Pessoal

Aplicativo mobile pessoal em React Native com Expo, TypeScript e Expo Router. A interface usa uma paleta escura com acentos verdes e ícones Lucide.

## Calendário

- Alterne entre as visualizações diária, semanal e mensal.
- Navegue pelos períodos com as setas ou volte à data atual com **Hoje**.
- Toque em um dia para selecioná-lo; a agenda abaixo acompanha a seleção.
- Cadastre compromissos com título, data, horário e observações opcionais.
- Os compromissos ficam salvos localmente em SQLite e são indicados por pontos no calendário.

## Estrutura

- `src/app/` — rotas e telas.
- `src/components/` — componentes de interface.
- `src/styles/` — estilos isolados por tela.
- `src/theme/` — tokens visuais compartilhados.
- `src/providers/` e `src/lib/` — estado e acesso aos dados.

## Requisitos

- Node.js LTS
- Expo Go instalado no Android

## Executar no Android

1. Instale as dependências com `npm install`.
2. Inicie o servidor com `npx expo start`.
3. Conecte o celular e o computador à mesma rede Wi-Fi e leia o QR code exibido usando o Expo Go.

Se a rede local bloquear a conexão, inicie com `npx expo start --tunnel`.

## Comandos

- `npm start` — inicia o servidor Expo.
- `npm run android` — inicia o Expo e tenta abrir no Android conectado.
- `npm run web` — inicia a versão web.
