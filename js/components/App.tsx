import React, { useEffect, useState } from 'react';
import GraphDiagram from '../graphdiagram/GraphDiagram.js';
import LoadActivity from '../util/LoadActivity.js';
import Module from '../util/Module.js';
import sharedStateHook from '../util/sharedStateHook.js';
import Inspector from './Inspector.js';
import { Loader } from './Loader.js';
import { Splitter } from './Splitter.js';
import '/css/App.scss';
import { GraphState } from '../graphdiagram/graph_util.js';

export const usePane = sharedStateHook('info', 'pane');
export const useInspectorOpen = sharedStateHook(true, 'inspectorOpen');
export const useQuery = sharedStateHook(queryFromLocation(), 'query');
export const useModule = sharedStateHook(
  undefined as Module | undefined,
  'module',
);
export const useGraph = sharedStateHook(null as GraphState | null, 'graph');
export const useColorize = sharedStateHook('', 'colorize');
export const useIncludeDev = sharedStateHook(false, 'includeDev');
export const useExcludes = sharedStateHook([] as string[], 'excludes');

export default function App() {
  const activity = useActivity();
  const [, setQuery] = useQuery();

  useEffect(() => {
    function handlePopState() {
      setQuery(queryFromLocation());
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [inspectorOpen, setInspectorOpen] = useInspectorOpen();

  return (
    <>
      {activity.total > 0 ? <Loader activity={activity} /> : null}
      <GraphDiagram activity={activity} />
      <Splitter
        isOpen={inspectorOpen}
        onClick={() => setInspectorOpen(!inspectorOpen)}
      />
      <Inspector className={inspectorOpen ? 'open' : ''} />
    </>
  );
}

// Parse `q` query param from browser location
function queryFromLocation() {
  const q = new URL(location.href).searchParams.get('q');
  return (q ?? '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

let activity: LoadActivity;
export function setActivityForApp(ack: LoadActivity) {
  activity = ack;
}

export function useActivity() {
  const [bool, setBool] = useState(true);
  if (!activity) throw new Error('Activity not set');
  activity.onChange = () => setBool(!bool);
  return activity;
}