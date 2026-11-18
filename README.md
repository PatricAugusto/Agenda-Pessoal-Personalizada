# Agenda Pessoal

Visual: MIRAI / Personal Evolution, com logo Ensō verde sobre fundo escuro.

Aplicativo mobile pessoal em React Native com Expo, TypeScript e Expo Router. A interface combina a paleta escura e os acentos verdes com superfícies translúcidas, desfoque e reflexos sutis no estilo liquid glass.

## Início e capacidade

- A tela inicial mostra a eficiência diária: minutos executados em relação ao tempo planejado, com o desvio e os compromissos que ainda aguardam fechamento.
- Ao fechar um compromisso, registre se foi concluído, parcial (com os minutos executados) ou desfeito.
- A média dos últimos dias considera apenas dias revisados; a tela também sinaliza quando a agenda passa de 90% da capacidade.
- Defina limites de horas e reuniões por dia. Os compromissos marcados como reunião entram no limite, e excessos geram uma recomendação do que reduzir.
- A capacidade acumulada da semana compara o tempo planejado com o limite diário configurado.

## Calendário

- Alterne entre as visualizações diária, semanal e mensal.
- Navegue pelos períodos com as setas ou volte à data atual com **Hoje**.
- Toque em um dia para selecioná-lo; a agenda abaixo acompanha a seleção.
- Cadastre compromissos com título, data, horário e observações opcionais.
- Informe o horário inicial e final; o intervalo aparece junto ao compromisso na agenda.
- Os compromissos ficam salvos localmente em SQLite e são indicados por pontos no calendário.
- Marque um compromisso como reunião ao cadastrá-lo para incluí-lo no limite diário.
- O Pomodoro oferece sessões de foco de 25 minutos e pausas de 5 minutos. Use o ícone de timer em um compromisso para iniciar o foco vinculado a ele.
- O efeito de vidro usa `expo-blur` e mantém o fundo escuro com detalhes verdes em todas as telas principais.

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

O perfil `preview` do EAS gera um APK instalável diretamente no aparelho. Esta versão é a **1.1.1** (`versionCode` Android **3**). O projeto já está vinculado ao EAS e o identificador Android é `com.agendapessoal.personalizada`; mantenha ambos estáveis para que futuras atualizações sejam reconhecidas como o mesmo aplicativo.

1. Abra o PowerShell na pasta do projeto e confirme que está conectado à sua conta Expo:

   ```powershell
   npx eas-cli@latest whoami
   ```

   Se não estiver conectado, crie uma conta gratuita em [expo.dev](https://expo.dev/signup) e execute `npx eas-cli@latest login`.

2. Gere o APK:

   ```powershell
   npx eas-cli@latest build --platform android --profile preview
   ```

3. Se solicitado, permita que o EAS gere e gerencie a chave de assinatura Android.
4. Ao concluir, abra o link do build exibido no terminal ou no painel EAS e baixe o APK.
5. Transfira o arquivo para o Android e abra-o para instalar. Se solicitado, permita a instalação de aplicativos dessa origem nas configurações do aparelho.

Esse APK é para instalação direta e testes pessoais; não é o pacote AAB destinado à Play Store. Não é necessária uma conta Google Play para gerar ou instalar o APK.

## Comandos

- `npm start` — inicia o servidor Expo.
- `npm run android` — inicia o Expo e tenta abrir no Android conectado.
- `npm run web` — inicia a versão web.
