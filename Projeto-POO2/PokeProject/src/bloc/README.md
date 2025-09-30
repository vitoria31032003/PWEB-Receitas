## Padrões de Projeto Aplicados na Pasta `src/bloc`

Esta pasta implementa o padrão de arquitetura BLOC (Business Logic Component), que é amplamente utilizado em aplicações de frontend, especialmente em frameworks como Flutter, mas seus princípios são aplicáveis a qualquer arquitetura que necessite de uma clara separação entre a lógica de negócios e a interface do usuário.

### BLOC (Business Logic Component) Pattern (`pokemon-bloc.js`)

O padrão BLOC visa gerenciar o estado da aplicação e a lógica de negócios de forma reativa e testável. Ele atua como um intermediário entre a camada de apresentação (UI) e a camada de dados, recebendo eventos da UI, processando-os com a lógica de negócios e emitindo novos estados que a UI pode consumir para se atualizar.

**`pokemon-bloc.js`:**
Este arquivo contém a implementação do BLOC para gerenciar o estado e a lógica relacionada aos Pokémon na aplicação. Ele é responsável por:

*   **Gerenciamento de Estado:** Mantém o estado atual da lista de Pokémon, filtros, status de carregamento, erros e habilidades.
*   **Processamento de Eventos:** Responde a eventos como `fetchPokemon` (para buscar Pokémon com base em filtros) e `loadAbilities` (para carregar habilidades).
*   **Comunicação com a Camada de Dados:** Utiliza instâncias de `pokemonAPI` (que pode ser um Adapter ou Decorator) para buscar dados.
*   **Emissão de Estados:** Notifica os ouvintes (componentes da UI) sobre as mudanças de estado através do método `_emit` e do `pokemonEventEmitter` (Observer).

**Benefícios do BLOC:**
*   **Separação de Preocupações:** Garante que a lógica de negócios esteja completamente desacoplada da interface do usuário, tornando o código mais organizado e fácil de manter.
*   **Reatividade:** Permite que a UI reaja automaticamente às mudanças de estado, proporcionando uma experiência de usuário fluida.
*   **Testabilidade:** A lógica de negócios pode ser testada independentemente da UI, facilitando a escrita de testes unitários e de integração.
*   **Reusabilidade:** O mesmo BLOC pode ser usado por múltiplos componentes da UI, promovendo a reusabilidade do código.
*   **Gerenciamento de Estado Centralizado:** Oferece um ponto centralizado para gerenciar o estado complexo da aplicação, evitando o "prop drilling" e facilitando a depuração.

### Observer Pattern (via `pokemon-event-emitter.js`)

Embora o BLOC em si não seja o padrão Observer, ele frequentemente o utiliza para notificar os componentes da UI sobre as mudanças de estado. O `pokemon-event-emitter.js` atua como um Subject (ou Observable) que o `PokemonBloc` utiliza para emitir eventos (`pokemonFetched`), e os componentes da UI podem se registrar como Observers para receber essas notificações.

**Benefícios:**
*   **Acoplamento Fraco:** O BLOC não precisa saber quais componentes estão interessados em suas mudanças de estado; ele apenas emite eventos.
*   **Flexibilidade:** Novos ouvintes podem ser adicionados ou removidos dinamicamente sem afetar o BLOC.

Em resumo, a pasta `src/bloc` é fundamental para a arquitetura da aplicação, aplicando o padrão BLOC para uma gestão de estado robusta e reativa, e utilizando o padrão Observer para comunicação eficiente entre a lógica de negócios e a interface do usuário.

