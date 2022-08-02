import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// MODELS
import { BillingCycleRequest } from '../models/billingCycle';
import { QueryAddressRequest } from '../models/queryAddress';
import { Guarantee } from '../models/guarantee';
import { HEADER_REQUEST } from '../models/headerRequest';
// SERVICES
import { ExternalService } from './external.service';
// SHOPPING CART ARTIFACTS
import { CicloFacturacionModel } from '../../../externals/libraries/domain/common/ciclo/ciclo';
import { DireccionModel, ListHhppsTemplate } from '../../../externals/libraries/domain/common/direccion/direccion';
import { UsuarioModel } from '../../../externals/libraries/domain/common/usuario/usuario';
import { ClienteModel } from '../../../externals/libraries/domain/common/cliente/cliente';
import { ShoppingCartIntegrationService } from '../../../externals/Modules/integration/order-negotiator-services/order-negotiator-shopping-cart-rest-client.service';
import { ShoppingCartType, ShoppingCartModel } from '../../../externals/libraries/domain/fullstack/order-negotiator/shopping-cart';


@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(
    private externaslService: ExternalService,
    private shoppingCartService: ShoppingCartIntegrationService
  ) { }

  public guarantee: Guarantee

  /**
   * Crea el carrito de compras
   * @returns Objeto con el modelo del carrito de compras
   */
  public createShoppingCart(): Promise<Observable<ShoppingCartModel>> {
    return Promise.all([this.userInfo, this.addressInfo, this.billingCycle]).then(([
      userInfo,addressInfo,billingCycle]) => {
        let client: ClienteModel
        let hhppPrioritario: ListHhppsTemplate
        return this.shoppingCartService.createShoppingCart(
          userInfo,
          // CLIENTE -> SAP - GETCUSTOMERPROFILE
          client,
          false,
          addressInfo,
          hhppPrioritario,
          billingCycle,
          ShoppingCartType.MOVIL_PREPAGO,
          // FLOWTYPE
          '',
          // CONTEXT
          {},
          // TOKEN
          '',
          // ISLEGACY => SE COLOCA FALSE
          false
        )

      })

  }

  /** Obtiene el ciclo de factuación del cliente*/
  private get billingCycle(): Promise<CicloFacturacionModel> {
    return new Promise<CicloFacturacionModel>((resolve) =>{
      let billingCycleRequest: BillingCycleRequest = {
        headerRequest: HEADER_REQUEST,
        pivotDate: "",
        idCycle: "",
        description: "",
        itemsNumber: "1"
      }
      this.externaslService.PostBillingCycle(billingCycleRequest).subscribe(res => {
        console.log('CICLO DE FACTURACIÓN', res)
        resolve(res)
      })
    })
  }

  /** Obtiene la información de la direccion del cliente */
  private get addressInfo(): Promise<DireccionModel> {
    return new Promise<DireccionModel>((resolve) =>{
      let address: DireccionModel
      let addressRequest: QueryAddressRequest = {
        headerRequest: HEADER_REQUEST,
        proyecto: "inspira",
        idDireccion: this.guarantee.idAddress,
        segmento: "MER"
      }
      this.externaslService.PutQueryAddress(addressRequest).subscribe(res => {
        console.log('DIRECCIÓN', res)
        resolve(address)
      })
    })
  }

  /** Obtiene la Información del usuario */
  private get userInfo(): Promise<UsuarioModel>{
    /** Devuelve el modelo de usuario diligenciado */
    const getUser = ():UsuarioModel => {
      let user: UsuarioModel
      user.firstName = this.guarantee.successFactorInfo.firstName
      user.lastName = this.guarantee.successFactorInfo.lastName
      user.documentType = this.guarantee.successFactorInfo.documentType
      user.documentId =this.guarantee.successFactorInfo.documentId
      user.profile = this.guarantee.successFactorInfo.profile
      user.email = this.guarantee.successFactorInfo.email
      user.position = this.guarantee.successFactorInfo.position
      user.costCenter = this.guarantee.successFactorInfo.costCenter
      user.department = this.guarantee.successFactorInfo.department
      user.city = this.guarantee.successFactorInfo.city
      user.dCode = this.guarantee.successFactorInfo.dCode
      user.businessStructureClass = this.guarantee.successFactorInfo.businessStructureClass
      user.personCode =Number(this.guarantee.successFactorInfo.personCode)
      user.salePoint = this.guarantee.successFactorInfo.salePoint
      user.employeeCode =Number(this.guarantee.successFactorInfo.employeeCode)
      user.commission = Boolean(this.guarantee.successFactorInfo.commission)
      user.direction = this.guarantee.successFactorInfo.direction
      user.committeeLeaderShip = this.guarantee.successFactorInfo.committeeLeaderShip
      user.directBoss = this.guarantee.successFactorInfo.directBoss
      user.employer = this.guarantee.successFactorInfo.employer
      user.admission = this.guarantee.successFactorInfo.admission.toString()
      //user.managementDirection = this.guarantee.successFactorInfo.managementDirection
      user.territory = this.guarantee.successFactorInfo.territory
      user.commercialStructureGroup = this.guarantee.successFactorInfo.commercialStructureGroup
      user.gvArea = this.guarantee.successFactorInfo.gvArea
      user.gvDistrict = this.guarantee.successFactorInfo.gvDistrict
      user.gvDivision = this.guarantee.successFactorInfo.gvDivision
      user.gvZone = this.guarantee.successFactorInfo.gvZone
      user.idArea = this.guarantee.successFactorInfo.idArea
      user.idDisctrict = this.guarantee.successFactorInfo.idDisctrict
      user.idDivision = this.guarantee.successFactorInfo.idDivision
      // user.idOffice =this.guarantee.successFactorInfo.salesOfficeSap
      user.idZone = this.guarantee.successFactorInfo.idZone
      user.gvRed = this.guarantee.successFactorInfo.gvRed
      user.contractTerminationReason = this.guarantee.successFactorInfo.contractTerminationReason
      user.userStatus = this.guarantee.successFactorInfo.userStatus
      user.salesSubChannel = this.guarantee.successFactorInfo.salesSubChannel
      user.commercialStructureType = this.guarantee.successFactorInfo.commercialStructureType
      user.networkUser = this.guarantee.successFactorInfo.networkUser
      user.polyhedronUser = this.guarantee.successFactorInfo.polyhedronUser
      user.acuser = this.guarantee.successFactorInfo.acuser
      user.sapBillingUser = this.guarantee.successFactorInfo.sapBillingUser
      user.rrUser = this.guarantee.successFactorInfo.rrUser
      user.responsiblePeopleUnit = this.guarantee.successFactorInfo.responsiblePeopleUnit
      user.responsibleHouseHoldUni = this.guarantee.successFactorInfo.responsibleHouseHoldUni
      user.responsibleBusinessUnit = this.guarantee.successFactorInfo.responsibleBusinessUnit
      user.advisorCallCenterCode = this.guarantee.successFactorInfo.advisorCallCenterCode
      user.idEmployer = this.guarantee.successFactorInfo.idEmployer
      user.modifiedBy = this.guarantee.successFactorInfo.modifiedBy
      user.modified = this.guarantee.successFactorInfo.modified.toString()
      user.idSap = this.guarantee.successFactorInfo.idSap
      user.sapCode = this.guarantee.successFactorInfo.sapCode
      user.salesChannel = this.guarantee.successFactorInfo.salesChannel
      user.salesOfficeSap = this.guarantee.successFactorInfo.salesOfficeSap
      user.nameLogistics_center = this.guarantee.successFactorInfo.nameLogistics_center
      console.log('USER INFO', user)
      return user
    }

    /** Si hay información de success factor llena el objeto, sino consulta el servicio de success factor y llena el objeto */
    return new Promise<UsuarioModel>((resolve) => {
      if (this.guarantee.successFactorInfo){
        resolve(getUser())
      }else {
        this.externaslService.getSuccessFactorInfo(this.guarantee).then(res=>{
          if (res) {
          resolve(getUser())
          }
        })
      }
    })
  }

}
