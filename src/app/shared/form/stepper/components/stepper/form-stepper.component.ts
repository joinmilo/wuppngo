import { AfterViewInit, Component, ContentChildren, EventEmitter, Input, OnDestroy, Output, QueryList } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, take, takeUntil } from 'rxjs';
import { ConfirmCancelComponent } from 'src/app/shared/dialogs/confirm-cancel/confirm-cancel.component';
import { ConfirmResetComponent } from 'src/app/shared/dialogs/confirm-reset/confirm-reset.component';
import { FormStepperActions } from '../../state/form-stepper.actions';
import { selectChangesMade } from '../../state/form-stepper.selectors';
import { FormStepComponent } from '../step/form-step.component';

@Component({
  selector: 'app-form-stepper',
  templateUrl: './form-stepper.component.html',
  styleUrls: ['./form-stepper.component.scss']
})
export class FormStepperComponent implements AfterViewInit, OnDestroy {

  @Input()
  public set linear(linear: boolean) {
    this.store.dispatch(FormStepperActions.setLinear(linear));
  }

  @Output()
  public cancelled = new EventEmitter<void>();

  @Output()
  public saved = new EventEmitter<void>();

  @ContentChildren(FormStepComponent)
  private steps?: QueryList<FormStepComponent>;

  private changesMade?: boolean;

  private destroy = new Subject<void>();

  constructor(
    private store: Store,
    private dialog: MatDialog,
  ) {
    this.store.select(selectChangesMade)
      .pipe(takeUntil(this.destroy))
      .subscribe(changesMade => this.changesMade = changesMade);
  }

  public ngAfterViewInit(): void {
    this.steps?.forEach((step, index) => step.index = index);
    this.store.dispatch(FormStepperActions.setLastStep((this.steps?.length || 0) - 1))
  }

  public cancel(): void {
    this.changesMade
      ? this.dialog.open(ConfirmCancelComponent).afterClosed()
          .pipe(take(1))
          .subscribe(shouldCancel => shouldCancel
            && this.cancelled.emit())
      : this.cancelled.emit();
  }

  public reset(): void {
    this.changesMade
      ? this.dialog.open(ConfirmResetComponent).afterClosed()
          .pipe(take(1))
          .subscribe(shouldCancel => shouldCancel
            && this.cancelled.emit())
      : this.cancelled.emit();
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

}