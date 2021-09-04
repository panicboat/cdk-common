import * as cdk from '@aws-cdk/core';
import * as appmesh from '@aws-cdk/aws-appmesh';
import { VirtualRouter } from './resources/vrouter';
import { VirtualService } from './resources/vservice';
import { VirtualNode } from './resources/vnode';

interface Props {
  projectName: string;
  serviceName: string;
  mesh: appmesh.IMesh;
  vRouterListeners: appmesh.VirtualRouterListener[];
  grpcRoute?: { name: string, match: appmesh.GrpcRouteMatch }[];
  httpRoute?: { name: string, match: appmesh.HttpRouteMatch }[];
  http2Route?: { name: string, match: appmesh.HttpRouteMatch }[];
  tcpRoute?: { name: string }[];
  nodes: { name: string, hostname: string, vNodeListeners: appmesh.VirtualNodeListener[], weight: number }[];
}
interface IMeshResources {
}
export class MeshResources extends cdk.Construct implements IMeshResources {
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    let grpcRoute = this.getValue(props.grpcRoute, []);
    let httpRoute = this.getValue(props.httpRoute, []);
    let http2Route = this.getValue(props.http2Route, []);
    let tcpRoute = this.getValue(props.tcpRoute, []);

    const node = new VirtualNode(this);
    node.createResources({ projectName: props.projectName, mesh: props.mesh, nodes: props.nodes });

    const router = new VirtualRouter(this);
    router.createResources({
      projectName: props.projectName, mesh: props.mesh, vRouterListeners: props.vRouterListeners, weightedTargets: node.weightedTargets,
      grpcRoute: grpcRoute, httpRoute: httpRoute, http2Route: http2Route, tcpRoute: tcpRoute
    });

    const service = new VirtualService(this);
    service.createResources({ projectName: props.projectName, serviceName: props.serviceName, router: router.router });
  }

  private getValue(inputValue: any, defaultValue: any): any {
    return inputValue !== undefined ? inputValue : defaultValue;
  }
}
