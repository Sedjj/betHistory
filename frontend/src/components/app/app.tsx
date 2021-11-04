import React, {Suspense, lazy} from 'react';

import {stylesContainer} from './app.module.less';

const LazyStrawberryIcon = lazy(() => import('./strawberry'));
export const App = (): React.ReactElement => (
	<div className={stylesContainer}>
		<div>It works</div>
		<Suspense fallback={'loading...'}>
			<LazyStrawberryIcon />
		</Suspense>
	</div>
);