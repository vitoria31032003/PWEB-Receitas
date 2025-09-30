## Padrões de Projeto Aplicados na Pasta `src/events`

Esta pasta é dedicada à implementação do padrão Observer, facilitando a comunicação desacoplada entre diferentes partes da aplicação através de um sistema de eventos.

### Observer Pattern (`pokemon-event-emitter.js`)

O padrão Observer define uma dependência um-para-muitos entre objetos, de modo que quando um objeto muda de estado, todos os seus dependentes são notificados e atualizados automaticamente. O objeto que muda de estado é chamado de Subject (ou Observable), e os objetos que são notificados são chamados de Observers.

**`pokemon-event-emitter.js`:**
Este arquivo implementa um `EventEmitter` simples que atua como o Subject no padrão Observer. Ele permite que:

*   **Objetos se registrem como Observers:** Através do método `on()`, componentes ou módulos podem "assinar" eventos específicos, tornando-se Observers.
*   **Objetos emitam eventos:** Através do método `emit()`, o Subject (neste caso, o `pokemonEventEmitter` ou o `PokemonBloc` que o utiliza) pode notificar todos os Observers registrados sobre uma mudança de estado ou ocorrência de um evento.

No contexto deste projeto, o `pokemonEventEmitter` é utilizado pelo `PokemonBloc` para emitir eventos como `pokemonFetched` quando novos dados de Pokémon são carregados. Componentes da interface do usuário ou outros módulos podem "ouvir" esses eventos para reagir às atualizações de dados sem ter uma dependência direta do `PokemonBloc`.

**Benefícios:**
*   **Desacoplamento:** O Subject (quem emite o evento) não precisa saber quem são seus Observers (quem recebe o evento). Isso reduz o acoplamento entre os componentes.
*   **Flexibilidade:** Novos Observers podem ser adicionados ou removidos dinamicamente em tempo de execução, sem a necessidade de modificar o código do Subject.
*   **Reusabilidade:** O sistema de eventos pode ser reutilizado para diferentes tipos de notificações em toda a aplicação.
*   **Comunicação Eficiente:** Permite que as mudanças em um objeto sejam propagadas para múltiplos objetos dependentes de forma eficiente e organizada.

Este padrão é crucial para a reatividade da aplicação, especialmente em conjunto com o padrão BLOC, garantindo que a interface do usuário seja atualizada de forma assíncrona e eficiente sempre que a lógica de negócios processar novos dados ou estados.

