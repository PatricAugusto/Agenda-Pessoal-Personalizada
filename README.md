# Agenda Pessoal

Aplicativo mobile pessoal em React Native com Expo, TypeScript e Expo Router. A interface usa uma paleta escura com acentos verdes e ícones Lucide.

## Calendário

- Alterne entre as visualizações diária, semanal e mensal.
- Navegue pelos períodos com as setas ou volte à data atual com **Hoje**.
- Toque em um dia para selecioná-lo; a agenda abaixo acompanha a seleção.
- Cadastre compromissos com título, data, horário e observações opcionais.
- Informe o horário inicial e final; o intervalo aparece junto ao compromisso na agenda.
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

## Gerar APK Android

O perfil `preview` do EAS gera um APK instalável diretamente no aparelho. O identificador Android configurado é `com.agendapessoal.personalizada`; mantenha-o estável para que futuras atualizações sejam reconhecidas como o mesmo aplicativo.

1. Abra o PowerShell na pasta do projeto e entre na sua conta Expo (crie uma conta gratuita em [expo.dev](https://expo.dev/signup), se necessário):

   ```powershell
   npx eas-cli@latest login
   ```

2. Gere o APK:

   ```powershell
   npx eas-cli@latest build --platform android --profile preview
   ```

3. Na primeira execução, aceite criar ou associar o projeto EAS e deixe o Expo gerar e gerenciar a chave de assinatura Android.
4. Ao concluir, abra o link do build exibido no terminal ou no painel EAS e baixe o APK.
5. Transfira o arquivo para o Android e abra-o para instalar. Se solicitado, permita a instalação de aplicativos dessa origem nas configurações do aparelho.

Esse APK é para instalação direta e testes pessoais; não é o pacote AAB destinado à Play Store. Não é necessária uma conta Google Play para gerar ou instalar o APK.

## Comandos

- `npm start` — inicia o servidor Expo.
- `npm run android` — inicia o Expo e tenta abrir no Android conectado.
- `npm run web` — inicia a versão web.
