# WORK_03 — Technical Interview Debrief (Debriefing de Entrevista Técnica)

**Nível:** Challenging (C1) | **Categoria:** Work | **Emoji:** ⚙️

## Visão geral

James O'Brien, Staff Engineer numa fintech de Dublin (FinCore), manda mensagem depois da sua entrevista técnica para aprofundar suas decisões de design de sistema. Ele vai questionar suas escolhas arquiteturais, pressionar por justificativas e esperar que você defenda suas decisões com clareza.

**Quem começa:** James  
**Objetivo:** Defender pelo menos 2 decisões técnicas com raciocínio claro e reconhecer pelo menos uma alternativa válida.

---

## Persona

**James O'Brien** — Staff Engineer, 41 anos, Dublin.  
Estilo: conciso, técnico, usa jargão (latency, trade-offs, scalability), humor seco ocasional.  
Comportamento: questiona toda resposta com "but what about X?"; respeita "I'm not sure, but my thinking was…" mais do que blefe.

---

## Vocabulário técnico essencial

| Termo | Exemplo de uso |
|---|---|
| trade-off | "There's a trade-off between consistency and availability here." |
| eventual consistency | "I chose eventual consistency to improve availability under load." |
| latency | "The main concern was reducing latency for the payment flow." |
| throughput | "We needed high throughput for the order service." |
| scalability | "This approach scales horizontally without much effort." |
| bottleneck | "The bottleneck was at the database layer." |
| fault tolerance | "We designed it to be fault tolerant with retry logic." |
| idempotent | "The endpoint is idempotent, so retries are safe." |

---

## Foco gramatical

**Explicar decisões no passado:**
- "I chose X over Y because…"
- "Given the constraints at the time, I decided to…"
- "The reason I went with X was that…"

**Reconhecer alternativas:**
- "In hindsight, I might have used…"
- "A valid alternative would have been…"
- "You're right — that's a trade-off I didn't fully account for."

**Pedir esclarecimento sem parecer inseguro:**
- "Just to make sure I understand — you're asking about the queue design specifically?"
- "Could you give me a bit more context on what you're probing for?"

---

## Frases úteis para este cenário

**Defender uma decisão:**
- "I went with eventual consistency because our system prioritizes availability over strict consistency — and for this particular service, that was an acceptable trade-off."
- "The bottleneck was the database, so I introduced a queue to decouple the write path."

**Reconhecer limitações:**
- "That's a fair point. If I were to redesign it, I'd probably consider..."
- "You're right that this approach has issues under high concurrency — I was aware of that but deprioritized it given the initial scale."

**Quando não sabe a resposta:**
- "I'm not 100% sure about the specifics, but my thinking was..."
- "I haven't worked with that specific pattern, but I'd approach it by..."

---

## Tópicos que James provavelmente vai questionar

1. **Eventual consistency** — por que não strong consistency?
2. **Queue choice** — Kafka vs RabbitMQ vs SQS
3. **Caching strategy** — onde colocar o cache, TTL, invalidation
4. **Failure modes** — o que acontece quando o serviço X cai?
5. **Idempotência** — como garantir que retries não duplicam dados?

---

## Dicas de sucesso

1. **Não blefe** — James respeita humildade intelectual mais do que respostas seguras porém erradas
2. **Use "trade-off"** — demonstra pensamento de engenheiro sênior
3. **Aceite críticas construtivamente** — "That's a fair point" abre a conversa
4. **Seja específico** — não diga "scalability issues"; diga "the write throughput was the bottleneck"
5. **Faça perguntas de volta** — "What approach does FinCore use for this?" mostra curiosidade

---

## Erros comuns de brasileiros neste cenário

| Errado | Certo |
|---|---|
| I make the system with Kafka | I built the system using Kafka |
| We had problems of latency | We had latency issues |
| The system is scalable | The system scales horizontally / is horizontally scalable |
| I think is better to use... | I think it would be better to use... |
| We did this because was faster | We did this because it was faster |

---

## Critério de sucesso

Defendeu pelo menos 2 decisões técnicas com raciocínio claro E reconheceu pelo menos uma alternativa válida ou limitação do design.
