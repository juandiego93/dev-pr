import { Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

import { Device } from 'src/app/models/device';
import { DeviceDetailComponent } from 'src/app/Modules/inventory/detail/device-detail/device-detail.component';


@Component({
  selector: 'app-consult-inventory',
  templateUrl: './consult-inventory.component.html',
  styleUrls: ['./consult-inventory.component.scss']
})

export class ConsultInventoryComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public displayedColumns: string[] = ['serial', 'brand', 'model', 'state', 'reserve', 'detail'];
  public dataSource;

  private filterValueActual: string;
  private listInventory = [];
  private device = {state: 'Stock libre utilización', reserve:false, reference:'GXS'} as Device

  constructor( private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.listInventory.push({ ...this.device, serial: '000000000000040', brand: 'SAMSUNG', model: 'Model 1'});
    this.listInventory.push({ ...this.device, serial: '000000000000041', brand: 'LG', model: 'Model 2'});
    this.listInventory.push({ ...this.device, serial: '000000000000042', brand: 'SAMSUNG', model: 'Model 1'});
    this.listInventory.push({ ...this.device, serial: '000000000000043', brand: 'LG', model: 'Model 2'});
    this.listInventory.push({ ...this.device, serial: '000000000000044', brand: 'LG', model: 'Model 2'});
    this.listInventory.push({ ...this.device, serial: '000000000000045', brand: 'SAMSUNG', model: 'Model 2'});
    this.listInventory.push({ ...this.device, serial: '000000000000046', brand: 'SAMSUNG', model: 'Model 1'});
    this.listInventory.push({ ...this.device, serial: '000000000000047', brand: 'LG', model: 'Model 2'});
    this.listInventory.push({ ...this.device, serial: '000000000000048', brand: 'SAMSUNG', model: 'Model 2'});
    this.listInventory.push({ ...this.device, serial: '000000000000049', brand: 'LG', model: 'Model 2'});
    this.listInventory.push({ ...this.device, serial: '000000000000050', brand: 'SAMSUNG', model: 'Model 1'});
    this.listInventory.push({ ...this.device, serial: '000000000000051', brand: 'LG', model: 'Model 1'});
    this.listInventory.push({ ...this.device, serial: '000000000000052', brand: 'SAMSUNG', model: 'Model 2'});
    this.listInventory.push({ ...this.device, serial: '000000000000053', brand: 'LG', model: 'Model 1'});
    this.dataSource = new MatTableDataSource(this.listInventory);
    this.dataSource.filterPredicate = function customFilter(data, filter: string): boolean {
      return (data.serial.toString().toLowerCase().includes(filter) || data.brand.toString().toLowerCase().includes(filter) || data.model.toString().toLowerCase().includes(filter) || data.state.toString().toLowerCase().includes(filter) );
    }
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.ApplyFilter(this.filterValueActual);

  }


  public ApplyFilter(filterValue: string): void {
    if (filterValue != undefined) {
      this.filterValueActual = filterValue;
      filterValue = filterValue.toString().trim();
      filterValue = filterValue.toString().toLowerCase();
      this.dataSource.filter = filterValue;
    }
  }

  public InventoryDetail(device: Device): void {
    device.disableInventory = true;
    this.dialog.open(DeviceDetailComponent, {
      data: device,
      disableClose: true
    });
  }
}


