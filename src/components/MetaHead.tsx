import React from 'react';
import { MetaTags, MetaTagsProps, useMetaTags } from './MetaTags';

export interface MetaHeadProps extends MetaTagsProps {}

export const MetaHead: React.FC<MetaHeadProps> = (props) => {
  return <MetaTags {...props} />;
};

export { MetaTags, useMetaTags };
export default MetaHead;

