import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs';
import { ContestCommentEntity, ContestEntity, Maybe, QueryOperator } from 'src/app/core/api/generated/schema';
import { CoreUserActions } from 'src/app/core/state/actions/core-user.actions';
import { CoreActions } from 'src/app/core/state/actions/core.actions';
import { selectCurrentUser } from 'src/app/core/state/selectors/user.selectors';
import { FeedbackType } from 'src/app/core/typings/feedback';
import { PortalActions } from 'src/app/portal/state/portal.actions';
import { GetContestCommentsGQL } from '../../../api/generated/get-contest-comments.query.generated';
import { GetContestDetailsGQL } from '../../../api/generated/get-contest-details.query.generated';
import { SaveContestCommentGQL } from '../../../api/generated/save-contest-comment.mutation.generated';
import { PortalContestDetailsActions } from './portal-contest-details.actions';
import { selectContestDetails } from './portal-contest-details.selectors';

@Injectable()
export class PortalContestDetailsEffects {

  getDetails = createEffect(() => this.actions.pipe(
    ofType(PortalContestDetailsActions.getDetails),
    switchMap((action) => this.getContestService.watch({
      entity: {
        slug: action.slug
      }
    }).valueChanges),
    map(response => response.data.getContest?.id
      ? PortalContestDetailsActions.setDetails(response.data.getContest as ContestEntity)
      : PortalActions.notFound())
  ));

  updateDetails = createEffect(() => this.actions.pipe(
    ofType(
      PortalContestDetailsActions.contestCommentSaved
    ),
    withLatestFrom(this.store.select(selectContestDetails)),
    switchMap(([, contestDetails]) => this.getContestService.watch({
      entity: {
        slug: contestDetails?.slug
      }
    }).valueChanges),
    map(response => response.data.getContest?.id
      ? PortalContestDetailsActions.detailsUpdated(response.data.getContest as ContestEntity)
      : PortalActions.notFound())
  ));

  detailsUpdated = createEffect(() => this.actions.pipe(
    ofType(PortalContestDetailsActions.detailsUpdated),
    map(() => CoreUserActions.updateUser())
  ));

  saveContestComment = createEffect(() => this.actions.pipe(
    ofType(PortalContestDetailsActions.saveContestComment),
    withLatestFrom(
      this.store.select(selectContestDetails),
      this.store.select(selectCurrentUser),
    ),
    map(([action, contest, user]) => (
      {
        ...action.entity,
        contest: { id: contest?.id },
        userContext: { id: user?.id }
      }
    )),
    switchMap(entity => this.saveContestCommentService.mutate({
      entity
    })),
    map(response => PortalContestDetailsActions.contestCommentSaved(response.data?.saveContestComment as ContestCommentEntity))
  ));

  contestCommentSaved = createEffect(() => this.actions.pipe(
    ofType(PortalContestDetailsActions.contestCommentSaved),
    map(() => CoreActions.setFeedback({
      type: FeedbackType.Success,
      labelMessage: 'commentSaved'
    }))
  ));

  getComments = createEffect(() => this.actions.pipe(
    ofType(PortalContestDetailsActions.getComments),
    switchMap(action => this.getCommentsService.watch({
      params: {
        sort: 'created',
        dir: 'desc',
        expression: {
          entity: {
            path: 'contest.slug',
            operator: QueryOperator.Equal,
            value: action.slug
          }
        }
      },
    }).valueChanges),
    map(response => PortalContestDetailsActions.setComments(response.data.getContestComments?.result as Maybe<ContestCommentEntity[]>))
  ));

  constructor(
    private actions: Actions,
    private getContestService: GetContestDetailsGQL,
    private store: Store,
    private saveContestCommentService: SaveContestCommentGQL,
    private getCommentsService: GetContestCommentsGQL,

  ) { }
}