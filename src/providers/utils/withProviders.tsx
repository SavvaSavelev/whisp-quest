import React from 'react';

export const withProviders = <P extends object>(
  Component: React.ComponentType<P>,
  providers: React.ComponentType<{ children: React.ReactNode }>[]
) => {
  return (props: P) => {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      <Component {...props} />
    );
  };
};