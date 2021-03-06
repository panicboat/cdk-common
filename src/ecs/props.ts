import { ScalingInterval } from "@aws-cdk/aws-autoscaling"
import { ScalingSchedule } from "@aws-cdk/aws-applicationautoscaling"
import { ISubnet, ISecurityGroup } from "@aws-cdk/aws-ec2"
import { ContainerDefinitionOptions, FargateService, ICluster, ScalableTaskCount, TaskDefinition } from "@aws-cdk/aws-ecs"
import { IManagedPolicy, IRole, Policy } from "@aws-cdk/aws-iam"
import { ILogGroup } from "@aws-cdk/aws-logs"
import { INamespace } from "@aws-cdk/aws-servicediscovery"

export interface Props {
  projectName: string
  vpc: {
    subnets: ISubnet[]
    securityGroups: ISecurityGroup[]
  }
  ecs: {
    cpu: number
    memoryLimitMiB: number
    appPorts: number[]
    containers: ContainerDefinitionOptions[]
    virtualNodeName: string
    logGroup: ILogGroup
    cluster: ICluster
    namespace: INamespace
    role: {
      execution: {
        managedPolicies: IManagedPolicy[]
        inlinePolicies: Policy[]
      }
      task: {
        managedPolicies: IManagedPolicy[]
        inlinePolicies: Policy[]
      }
    }
  }
  autoScale: {
    minCapacity: number
    maxCapacity: number
    cpuUtilization?: {
      steps?: ScalingInterval[]
      target?: number
    }
    memoryUtilization?: {
      steps?: ScalingInterval[]
      target?: number
    }
    schedules?: ScalingSchedule[]
  }
}

export interface TaskExecutionRoleProps {
  projectName: string
  managedPolicies: IManagedPolicy[]
  inlinePolicies: Policy[]
}

export interface TaskRoleProps {
  projectName: string
  managedPolicies: IManagedPolicy[]
  inlinePolicies: Policy[]
}

export interface TaskDefinitionProps {
  projectName: string
  cpu: number
  memoryLimitMiB: number
  appPorts: number[]
  virtualNodeName: string
  taskRole: IRole
  executionRole: IRole
  logGroup: ILogGroup
  containers: ContainerDefinitionOptions[]
}

export interface FargateServiceProps {
  projectName: string
  cluster: ICluster
  taskDefinition: TaskDefinition
  namespace: INamespace
  desiredCount: number
  securityGroups: ISecurityGroup[]
  subnets: ISubnet[]
}

export interface ScaleCapacityProps {
  service: FargateService
  minCapacity: number
  maxCapacity: number
}

export interface StepScalingProps {
  projectName: string
  service: FargateService
  capacity: ScalableTaskCount
  scalingIntervals: ScalingInterval[]
}

export interface TargetTrackingScalingProps {
  projectName: string
  service: FargateService
  capacity: ScalableTaskCount
  utilizationPercent: number
}

export interface ScheduledScalingProps {
  projectName: string
  service: FargateService
  capacity: ScalableTaskCount
  schedules: ScalingSchedule[]
}
