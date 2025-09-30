## Padrões de Projeto Aplicados na Pasta `src/utils`

Esta pasta contém utilitários e estratégias que implementam diversos padrões de projeto para promover a flexibilidade, extensibilidade e manutenibilidade do código.

### Visitor Pattern (`pokemon-stat-visitor.js`)

O padrão Visitor é utilizado para definir uma nova operação a ser executada em elementos de uma estrutura de objetos sem alterar as classes dos elementos sobre os quais opera. No contexto deste projeto, `pokemon-stat-visitor.js` permite processar diferentes tipos de estatísticas de Pokémon de maneira desacoplada.

**Benefícios:**
*   **Extensibilidade:** Facilita a adição de novas operações (novos visitantes) sem modificar as classes de estatísticas existentes.
*   **Separação de Preocupações:** Mantém o código de operação separado das classes de dados.

### Strategy Pattern (`filterStrategies.js`, `sortStrategies.js`)

O padrão Strategy define uma família de algoritmos, encapsula cada um deles e os torna intercambiáveis. Ele permite que o algoritmo varie independentemente dos clientes que o utilizam. No projeto, `filterStrategies.js` e `sortStrategies.js` são exemplos claros da aplicação deste padrão.

**`filterStrategies.js`:**
Define diferentes algoritmos para filtrar a lista de Pokémon com base em vários critérios (nome, tipo, fraqueza, etc.). Cada estratégia de filtro é uma classe ou função separada que implementa uma interface comum (ou contrato).

**`sortStrategies.js`:**
Define diferentes algoritmos para ordenar a lista de Pokémon. Similar aos filtros, cada estratégia de ordenação é encapsulada, permitindo que a lógica de ordenação seja facilmente trocada em tempo de execução.

**Benefícios:**
*   **Flexibilidade:** Permite a fácil adição de novas estratégias de filtro ou ordenação sem modificar o código existente que utiliza essas estratégias.
*   **Reusabilidade:** As estratégias podem ser reutilizadas em diferentes partes da aplicação.
*   **Manutenibilidade:** O código se torna mais fácil de entender e manter, pois cada algoritmo tem sua própria implementação.

### Outros Utilitários (`categoryFilterKeys.js`)

`categoryFilterKeys.js` é um utilitário que fornece chaves para filtros de categoria, auxiliando na organização e padronização do acesso aos filtros na aplicação. Embora não seja um padrão de projeto formal, ele contribui para a clareza e consistência do código, alinhando-se com princípios de boa arquitetura de software.

