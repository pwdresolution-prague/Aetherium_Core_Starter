import { renderModuleProgressChart } from './ProgressGraph.js';

// COMMENT: Zatím testovací data natvrdo - nahradí se voláním na Supabase,
// až bude hotová tabulka se stavem modulů studenta (viz níže)
const MOCK_MODULES = [
  { id: 'bozp-zaklad', status: 'completed' },
  { id: 'pozarni-ochrana', status: 'completed' },
  { id: 'prace-ve-vyskach', status: 'inProgress' },
  { id: 'prvni-pomoc', status: 'notStarted' },
];

renderModuleProgressChart('moduleProgressChartId', 'moduleProgressMotivationId', MOCK_MODULES);
