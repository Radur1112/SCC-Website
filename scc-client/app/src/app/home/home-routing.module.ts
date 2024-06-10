import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReclutamientoComponent } from './reclutamiento/reclutamiento.component';

const routes: Routes = [
  { path: 'reclutamiento', component: ReclutamientoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
