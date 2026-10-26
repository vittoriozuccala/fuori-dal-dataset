---
title: "Venticinquemila commit in una notte: cronaca di un aggiornamento Hermes"
date: "2026-10-26T11:00:00+01:00"
description: "Domenica notte ho aggiornato Hermes: 25.521 commit, tre bot muti al risveglio e una mattina di riparazioni con Claude Code."
draft: false
categories:
  - "Informatica"
tags:
  - "hermes"
  - "vps"
  - "agentic-ai"
  - "aggiornamenti"
---

![Aggiornamento di Hermes andato storto di notte](/immagini/hermes_update_ott26_cover.jpg)

Ieri sera, alle 23:40 di domenica 25 ottobre, ho lanciato l'aggiornamento di Hermes.

Si, ok, non si devono fare queste cose prima di andare a dormire e non so perchè ci casco sempre ma anche questa volta non ho saputo resistere alla tentazione di farlo...

L'aggiornamento era imponente: oltre alle varie patch di sicurezza, c'erano due modifiche infrastrutturali importanti:

- Il **gateway**: fino al mese scorso ogni profilo aveva il proprio gateway ed io ne avevo 5 differenti: l'aggiornamento ha condensato i gateway in uno solo che serve tutti i profili esistenti. Ciò implica meno RAM occupata ma anche una modifica sostanziale del funzionamento
- **Hindsight**: lo strumento che utilizzo per fare il retain delle memorie è Hindsight, un modulo di PostgresSQL per rendere questo db vettoriale e poter accogliere le memorie del LLM

Ovviamente qualcosa ieri sera si è rotto ma essendo parecchio stanco sono andato ugualmente a letto.
Stamattina alle 7:58 ho messo in pista *Claude Code* e gli ho chiesto di comprendere per quale motivo tre bot su cinque fossero muti.

Tra le due cose ci sono venticinquemila commit, un compilatore mancante, un gateway che si riavviava ogni cinque minuti e un cron job che ha fallito proprio nel momento in cui doveva dirmi che era andato tutto bene.

<!-- more -->

# Cosa c'era dentro la nuova versione

Il punto di partenza era il commit `d15ed44452`, fermo all'11 settembre. Quarantaquattro giorni di arretrato, che su un progetto così non sono pochi. L'aggiornamento ha portato il checkout al commit `1f91da2a27`, versione v0.22.5+1315.g1f91da2, scaricando **25.521 commit**. Senza contare i merge, 24.765.

Dentro c'è di tutto. Oltre quindicimila correzioni, quasi duemila funzionalità nuove, un solo commit dichiarato come rottura di compatibilità. Ottantadue commit che citano la sicurezza nel titolo, quarantuno con lo scope dichiarato.

Le aree più toccate sono l'interfaccia desktop, il gateway, il catalogo dei plugin e la macchina degli aggiornamenti. Chi usa Hermes da terminale e da Telegram, come me, vive soprattutto delle ultime due.

Un salto di questa dimensione non è un click. È un intervento chirurgico su un sistema che nel frattempo è cambiato in profondità.

# La notte

**Eunus**, l'agente del profilo principale, ha fatto le cose per bene.

Dopo aver effettuato il backup: 762 MB, 28.651 file ed il dump del database di Hindsight da 52 MB ha replicato tutto su un remote cifrato.

Poi è partito con il censimento: 31 cron job attivi sul profilo principale, uno su Charlie, sei su Hyacinthus, due su Plutarco (gli altri miei profili).

A questo punto ha lanciato l'update in una unit staccata dal gateway, con trenta secondi di attesa per farmi arrivare il messaggio prima che il servizio si riavviasse sotto i piedi.

Alle 23:45 il primo guasto. La sincronizzazione delle dipendenze è uscita con errore: la libreria olm va compilata, e sulla VPS mancava `clang++`. Il codice però era già stato scaricato, quindi il problema riguardava solo l'ambiente Python.

Alle 23:47 il secondo, ed era quello che Eunus aveva previsto. I gateway stavano ancora girando il codice vecchio in memoria, con il codice nuovo già sul disco. I cron hanno cominciato a fallire con un `ImportError` su `request_yield`, e il worker esterno non rispondeva più entro cinque secondi.

Alle 23:48 il terzo: senza quel compilatore, Matrix e Telegram non si sarebbero caricati al riavvio. Compilatore installato, dipendenze rifatte, exit 0.

Rimaneva il passaggio più delicato. La nuova versione dell'updater aspetta che il gateway si svuoti prima di riavviarlo, un protocollo di drain. Il gateway vecchio quel protocollo non lo conosce, quindi non rispondeva, e l'updater scriveva nei log di non sapere cosa stesse aspettando. Restava il restart forzato, previsto intorno alla mezzanotte e ventiquattro.

A quel punto Eunus non poteva fare altro. Non può riavviare il gateway da dentro la propria sessione, perché si ammazzerebbe a metà del lavoro. Ha messo un cron one shot all'una e trentacinque con la verifica completa da consegnarmi al risveglio.

Quel cron è fallito alle 8:01 con un `GatewayUnavailableError`. Il motivo è semplice: il gateway non era raggiungibile perché era in crash loop da ore.

# Il risveglio

Stamattina ho trovato tre bot muti. Default, Hyacinthus e Tucker non rispondevano. Charlie e Plutarco rispondevano, ma ognuno per conto proprio.

Il resto l'ha ricostruito Claude in venti minuti di diagnosi. Il gateway del profilo principale si era riavviato più di cento volte, a intervalli di cinque minuti, e a ogni giro usciva con lo stesso errore: non riusciva a prenotare i profili già occupati da Charlie e Plutarco. Hyacinthus e Tucker venivano rifiutati con un messaggio ancora più secco, un profilo non ha diritto a un gateway tutto suo.

La causa non era un bug. Era un cambio di architettura. La nuova versione prevede un solo gateway per macchina, che serve tutti i profili, e considera quella topologia l'unica supportata. Sulla VPS però erano ancora installate e abilitate le quattro vecchie unit di sistema, una per profilo, che continuavano a prenotare i profili per conto loro.

Il codice nuovo funzionava. Era il modo in cui la macchina era montata a non funzionare più.

# L'intervento di Claude

Claude ha lavorato tra le 7:58 e le 8:22, e ha fatto le cose nell'ordine giusto.

Prima ha fermato e disabilitato le quattro unit dei singoli profili. Poi ha lanciato la migrazione verso il multiplexer, con un dry run prima, per controllare che non ci fossero token duplicati o conflitti di porta. Poi ha riavviato il gateway unico: cinque bot Telegram connessi, il bridge WhatsApp in piedi, Matrix attivo.

Alle 8:03 ha rimosso le quattro unit, su mia richiesta, tenendone una copia in una cartella di backup. Un solo gateway, cinque profili. I profili nuovi d'ora in poi vengono rilevati da soli, senza unit dedicate.

Poi la parte noiosa, quella che nessuno racconta. Tre avvisi che sporcavano i log da chissà quanto: tre piattaforme non configurate che puntavano a pacchetti di tool non più esistenti, una vecchia copia della skill kanban che collideva con un comando diventato nativo, e sei file orfani in attesa di consegna che facevano fallire il recupero dei messaggi a ogni avvio.

Su quest'ultimo Claude si è corretto da solo. All'inizio aveva pensato a messaggi persi durante il malfunzionamento. Erano solo metadati di sessioni cancellate, nessun messaggio mio dentro. Lo ha scritto nel report senza nascondere l'errore di valutazione.

Poi il caso più interessante. Un avviso insisteva sul fatto che il servizio avesse un timeout di arresto troppo corto, novanta secondi. Claude ha controllato la unit di sistema e ne ha trovati duecentodieci. Il difetto era nel codice: la funzione che legge il timeout interroga prima l'istanza utente di systemd, che per una unit inesistente risponde comunque con successo restituendo il valore predefinito di novanta secondi. Il programma prende per buono quel numero e non arriva mai a leggere la configurazione vera.

# Adesso

Il gateway è attivo da due ore, zero riavvii, cinque profili serviti, cinque bot che rispondono. Li ho verificati con un messaggio a ciascuno. Il resto dell'infrastruttura non è stato toccato: dashboard, workspace, i servizi di casa.

La cosa che mi porto dietro non è tecnica. L'aggiornamento automatico mi ha dato venticinquemila commit in una notte, e non è poco. Il rischio però non era nel codice nuovo, che ha funzionato. Era nel fatto che l'architettura era cambiata e la mia macchina no. Nessun changelog te lo dice in anticipo con chiarezza, e nessun agente può sapere come è montato il tuo sistema se non lo guarda.

Mi chiedo quanti di voi aggiornano un servizio che gira da solo, di notte, senza nessuno che controlli. E cosa fate quando la mattina dopo il bot non risponde.
