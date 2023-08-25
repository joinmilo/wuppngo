import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Maybe, MediaEntity } from 'src/app/core/api/generated/schema';
import { slug } from 'src/app/core/constants/core.constants';
import { MediaDisplayType } from 'src/app/core/typings/filter-params/media-display';
import { RadioInput } from 'src/app/shared/form/radio-button/typings/radio-input';
import { MimeTypeDefinition } from 'src/app/shared/widgets/media/typings/media';
import { mimeTypeDefinition } from 'src/app/shared/widgets/media/utils/media.utils';
import { ArticlePortalDetailsActions } from '../../state/article-portal-details.actions';
import { selectArticleMedia } from '../../state/article-portal-details.selectors';

@Component({
  selector: 'app-article-portal-details-media',
  templateUrl: './article-portal-details-media.component.html',
  styleUrls: ['./article-portal-details-media.component.scss']
})
export class ArticlePortalDetailsMediaComponent implements OnDestroy {

  public fileType = MediaDisplayType.Image;

  private destroy = new Subject<void>();

  public inputs: RadioInput[] = [
    {
      icon: ['fas', 'image'],
      label: 'images',
      value: MediaDisplayType.Image
    },{
      icon: ['fas', 'video'],
      label: 'videos',
      value: MediaDisplayType.Video
    },
    {
      icon: ['fas', 'file'],
      label: 'files',
      value: MediaDisplayType.File
    }
  ];

  public media = this.store.select(selectArticleMedia);

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
  ) {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy))
      .subscribe(params => this.store.dispatch(
        ArticlePortalDetailsActions.getDetails(params.get(slug) || '')));
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  public mimeType(element?: Maybe<MediaEntity>): Maybe<MimeTypeDefinition> {
    return mimeTypeDefinition(element);
  }
}