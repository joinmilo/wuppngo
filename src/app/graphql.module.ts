import { NgModule } from '@angular/core';
import { ApolloLink, DefaultOptions, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { environment } from 'src/environments/environment';

import { AuthService } from './core/services/auth/auth.service';

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink, authService: AuthService) => {
        const auth = setContext(() => ({ headers: { Authorization: `Bearer ${authService.tokens?.access ?? ''}` } }));

        const link = ApolloLink.from([auth, httpLink.create({ uri: new URL('/api/graphql', environment.api).href })]);
        const cache = new InMemoryCache({
          addTypename: false
        });

        const defaultOptions: DefaultOptions = {
          watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore',
          },
          query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
          mutate: {
            fetchPolicy: 'no-cache',
          }
        }

        return {
          link,
          cache,
          defaultOptions
        };
      },
      deps: [HttpLink, AuthService],
    },
  ],
})
export class GraphQLModule {}
