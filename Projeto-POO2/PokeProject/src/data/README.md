## Padrões de Projeto Aplicados na Pasta `src/data`

Esta pasta é responsável pela interação com fontes de dados externas (como a PokeAPI) e pela transformação desses dados para o formato utilizado na aplicação. Ela implementa e utiliza diversos padrões de projeto para garantir a flexibilidade, o desacoplamento e a manutenibilidade da camada de dados.

### Adapter Pattern (`pokemon-api-adapter.js`)

O padrão Adapter (também conhecido como Wrapper) permite que interfaces incompatíveis trabalhem juntas. Ele converte a interface de uma classe para outra interface que o cliente espera. No contexto deste projeto, `pokemon-api-adapter.js` atua como um adaptador para a PokeAPI.

**`pokemon-api-adapter.js`:**
Este arquivo encapsula as chamadas diretas à PokeAPI, fornecendo uma interface consistente para a aplicação, independentemente de como a API externa funciona internamente. Se a estrutura da PokeAPI mudar, apenas o adaptador precisará ser modificado, protegendo o restante da aplicação.

**Benefícios:**
*   **Reusabilidade:** Permite a integração de classes existentes com interfaces incompatíveis.
*   **Flexibilidade:** Facilita a troca de APIs externas sem impactar a lógica de negócios.
*   **Desacoplamento:** Reduz a dependência direta da aplicação em relação a uma API específica.

### Decorator Pattern (`pokemon-api-logging-decorator.js`)

O padrão Decorator (também conhecido como Wrapper) permite adicionar novas funcionalidades a um objeto existente dinamicamente, sem alterar sua estrutura. Ele envolve o objeto original com um objeto decorador que adiciona o novo comportamento.

**`pokemon-api-logging-decorator.js`:**
Este arquivo é um exemplo de Decorator que adiciona funcionalidade de log às chamadas da `PokemonAPIAdapter`. Em vez de modificar diretamente o `PokemonAPIAdapter` para incluir logs, o Decorator o envolve, interceptando as chamadas e adicionando o comportamento de log antes ou depois da execução do método original.

**Benefícios:**
*   **Extensibilidade:** Adiciona responsabilidades a objetos individualmente e dinamicamente, sem afetar outros objetos da mesma classe.
*   **Flexibilidade:** Evita a criação de subclasses para cada combinação de comportamentos, o que poderia levar a uma explosão de classes.
*   **Manutenibilidade:** Mantém o código limpo e modular, separando as preocupações.

### Composition (Composição de Objetos)

Embora não haja um arquivo dedicado explicitamente a um padrão de composição, o conceito de composição é fundamental na forma como o `PokemonAPIAdapter` e o `PokemonAPILoggingDecorator` interagem. O `PokemonAPILoggingDecorator` **compõe** uma instância de `PokemonAPIAdapter` (ou qualquer objeto que implemente a mesma interface) para adicionar sua funcionalidade de log. Isso é um exemplo de "composição sobre herança", um princípio fundamental de design.

**Benefícios:**
*   **Flexibilidade:** Permite a criação de objetos complexos a partir de objetos mais simples.
*   **Reusabilidade:** Componentes podem ser reutilizados em diferentes composições.
*   **Acoplamento Fraco:** Reduz a dependência entre classes, pois a funcionalidade é obtida pela composição de objetos em vez de herança rígida.

### Data Mapper Pattern (`pokemon-data-mapper.js`)

O padrão Data Mapper é um padrão de camada de dados que separa a camada de objeto na memória (o modelo de domínio) do banco de dados ou da camada de persistência. Ele lida com a transferência de dados entre os dois e garante que o modelo de domínio não precise saber sobre o banco de dados.

**`pokemon-data-mapper.js`:**
Este arquivo é responsável por mapear os dados brutos recebidos da PokeAPI (que podem ter uma estrutura complexa e aninhada) para um formato de objeto mais limpo e consistente que é utilizado pelo restante da aplicação. Isso garante que a lógica de negócios trabalhe com um modelo de dados simplificado e desacoplado da estrutura da API externa.

**Benefícios:**
*   **Separação de Preocupações:** Desacopla o modelo de domínio da lógica de persistência/API.
*   **Flexibilidade:** Facilita a mudança da fonte de dados ou da estrutura da API externa sem afetar o modelo de domínio.
*   **Consistência:** Garante que os dados sejam apresentados de forma uniforme em toda a aplicação.

Em resumo, a pasta `src/data` é um exemplo robusto de como padrões de projeto podem ser aplicados para criar uma camada de dados resiliente, adaptável e fácil de manter.

