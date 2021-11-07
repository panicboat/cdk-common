import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import { ISecurityGroup, ISubnet } from '@aws-cdk/aws-ec2';
import { IManagedPolicy, Policy } from '@aws-cdk/aws-iam';
import { INamespace } from '@aws-cdk/aws-servicediscovery';
import { LogGroup } from '@aws-cdk/aws-logs';
import { ScalingInterval } from '@aws-cdk/aws-applicationautoscaling'
import { Iam } from './resources/iam';
import { TaskDefinition } from './resources/taskdefinition';
import { Service } from './resources/service';
import { AutoScale } from './resources/autoscale';

interface Props {
  projectName: string;
  vpc: {
    subnets: ISubnet[];
    securityGroups: ISecurityGroup[];
  }
  ecs: {
    cpu: number;
    memoryLimitMiB: number;
    appPorts: number[];
    containers: ecs.ContainerDefinitionOptions[];
    virtualNodeName: string;
    logGroup: LogGroup;
    cluster: ecs.ICluster;
    namespace: INamespace;
    role: {
      execution: {
        managedPolicies: IManagedPolicy[];
        inlinePolicies: Policy[];
      }
      task: {
        managedPolicies: IManagedPolicy[];
        inlinePolicies: Policy[];
      }
    }
  }
  autoScale: {
    minCapacity: number;
    maxCapacity: number;
    cpuUtilization?: {
      steps?: ScalingInterval[];
      target?: number;
    }
  }
}
interface IEcsResources {
  readonly service: ecs.FargateService;
}
export class EcsResources extends cdk.Construct implements IEcsResources {
  public service!: ecs.FargateService;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    let cpuUtilization = props.autoScale.cpuUtilization || {}

    const iam = new Iam(this);
    iam.createResources({
      projectName: props.projectName,
      ecsTaskExecutionRole: { managedPolicies: props.ecs.role.execution.managedPolicies, inlinePolicies: props.ecs.role.execution.inlinePolicies },
      ecsTaskRole: { managedPolicies: props.ecs.role.task.managedPolicies, inlinePolicies: props.ecs.role.task.inlinePolicies },
    });

    const taskdef = new TaskDefinition(this);
    taskdef.createResources({
      projectName: props.projectName, cpu: props.ecs.cpu, memoryLimitMiB: props.ecs.memoryLimitMiB, appPorts: props.ecs.appPorts, virtualNodeName: props.ecs.virtualNodeName,
      executionRole: iam.executionRole, taskRole: iam.taskRole, logGroup: props.ecs.logGroup, containers: props.ecs.containers,
    });

    const service = new Service(this);
    service.createResources({
      projectName: props.projectName, cluster: props.ecs.cluster, taskDefinition: taskdef.taskDefinition, namespace: props.ecs.namespace,
      desiredCount: props.autoScale.minCapacity, securityGroups: props.vpc.securityGroups, subnets: props.vpc.subnets,
    });

    const autoscale = new AutoScale(this);
    autoscale.createResources({
      projectName: props.projectName, service: service.service,
      minCapacity: props.autoScale.minCapacity, maxCapacity: props.autoScale.maxCapacity,
      cpuUtilization: { steps: cpuUtilization.steps || [], target : cpuUtilization.target || 0, }
    });

    this.service = service.service;
  }
}
