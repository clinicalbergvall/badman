// Define React namespace and types to fix the 'Cannot find namespace React' errors
import * as ReactNS from 'react';

declare global {
  namespace React {
    export = ReactNS;
  }
  
  // Define JSX namespace to support JSX elements
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Define React namespace for component types
declare namespace React {
  export import Component = ReactNS.Component;
  export import FunctionComponent = ReactNS.FunctionComponent;
  export import FC = ReactNS.FC;
  export import StatelessComponent = ReactNS.StatelessComponent;
  export import createElement = ReactNS.createElement;
  export import cloneElement = ReactNS.cloneElement;
  export import createContext = ReactNS.createContext;
  export import forwardRef = ReactNS.forwardRef;
  export import memo = ReactNS.memo;
  export import lazy = ReactNS.lazy;
  export import Suspense = ReactNS.Suspense;
  export import StrictMode = ReactNS.StrictMode;
  export import Fragment = ReactNS.Fragment;
  export import Profiler = ReactNS.Profiler;
  export import Portal = ReactNS.Portal;
  export import Children = ReactNS.Children;
  
  // Hooks
  export import useState = ReactNS.useState;
  export import useEffect = ReactNS.useEffect;
  export import useLayoutEffect = ReactNS.useLayoutEffect;
  export import useReducer = ReactNS.useReducer;
  export import useCallback = ReactNS.useCallback;
  export import useMemo = ReactNS.useMemo;
  export import useRef = ReactNS.useRef;
  export import useImperativeHandle = ReactNS.useImperativeHandle;
  export import useDebugValue = ReactNS.useDebugValue;
  export import useId = ReactNS.useId;
  export import useSyncExternalStore = ReactNS.useSyncExternalStore;
  export import useTransition = ReactNS.useTransition;
  export import useDeferredValue = ReactNS.useDeferredValue;
  export import useInsertionEffect = ReactNS.useInsertionEffect;
  export import useViewport = ReactNS.useViewport;
  
  // Types
  export import ReactNode = ReactNS.ReactNode;
  export import ReactElement = ReactNS.ReactElement;
  export import ComponentClass = ReactNS.ComponentClass;
  export import SFC = ReactNS.SFC;
  export import StatelessFunctionalComponent = ReactNS.StatelessFunctionalComponent;
  export import ReactType = ReactNS.ReactType;
  export import ComponentState = ReactNS.ComponentState;
  export import PropsWithChildren = ReactNS.PropsWithChildren;
  export import MutableRefObject = ReactNS.MutableRefObject;
  export import RefObject = ReactNS.RefObject;
  export import SyntheticEvent = ReactNS.SyntheticEvent;
  export import ClipboardEvent = ReactNS.ClipboardEvent;
  export import CompositionEvent = ReactNS.CompositionEvent;
  export import DragEvent = ReactNS.DragEvent;
  export import FocusEvent = ReactNS.FocusEvent;
  export import FormEvent = ReactNS.FormEvent;
  export import InvalidEvent = ReactNS.InvalidEvent;
  export import ChangeEvent = ReactNS.ChangeEvent;
  export import KeyboardEvent = ReactNS.KeyboardEvent;
  export import MouseEvent = ReactNS.MouseEvent;
  export import TouchEvent = ReactNS.TouchEvent;
  export import PointerEvent = ReactNS.PointerEvent;
  export import UIEvent = ReactNS.UIEvent;
  export import WheelEvent = ReactNS.WheelEvent;
  export import AnimationEvent = ReactNS.AnimationEvent;
  export import TransitionEvent = ReactNS.TransitionEvent;
  export import DetailedHTMLProps = ReactNS.DetailedHTMLProps;
  export import HTMLAttributes = ReactNS.HTMLAttributes;
  export import HTMLProps = ReactNS.HTMLProps;
  export import AllHTMLAttributes = ReactNS.AllHTMLAttributes;
  export import ColHTMLAttributes = ReactNS.ColHTMLAttributes;
  export import CellHTMLAttributes = ReactNS.CellHTMLAttributes;
  export import AreaHTMLAttributes = ReactNS.AreaHTMLAttributes;
  export import BaseHTMLAttributes = ReactNS.BaseHTMLAttributes;
  export import BlockquoteHTMLAttributes = ReactNS.BlockquoteHTMLAttributes;
  export import ButtonHTMLAttributes = ReactNS.ButtonHTMLAttributes;
  export import CanvasHTMLAttributes = ReactNS.CanvasHTMLAttributes;
  export import ColgroupHTMLAttributes = ReactNS.ColgroupHTMLAttributes;
  export import DetailsHTMLAttributes = ReactNS.DetailsHTMLAttributes;
  export import DialogHTMLAttributes = ReactNS.DialogHTMLAttributes;
  export import EmbedHTMLAttributes = ReactNS.EmbedHTMLAttributes;
  export import FieldsetHTMLAttributes = ReactNS.FieldsetHTMLAttributes;
  export import FormHTMLAttributes = ReactNS.FormHTMLAttributes;
  export import HtmlHTMLAttributes = ReactNS.HtmlHTMLAttributes;
  export import IframeHTMLAttributes = ReactNS.IframeHTMLAttributes;
  export import ImgHTMLAttributes = ReactNS.ImgHTMLAttributes;
  export import InsHTMLAttributes = ReactNS.InsHTMLAttributes;
  export import InputHTMLAttributes = ReactNS.InputHTMLAttributes;
  export import KeygenHTMLAttributes = ReactNS.KeygenHTMLAttributes;
  export import LabelHTMLAttributes = ReactNS.LabelHTMLAttributes;
  export import LiHTMLAttributes = ReactNS.LiHTMLAttributes;
  export import LinkHTMLAttributes = ReactNS.LinkHTMLAttributes;
  export import MapHTMLAttributes = ReactNS.MapHTMLAttributes;
  export import MenuHTMLAttributes = ReactNS.MenuHTMLAttributes;
  export import MediaHTMLAttributes = ReactNS.MediaHTMLAttributes;
  export import MetaHTMLAttributes = ReactNS.MetaHTMLAttributes;
  export import MeterHTMLAttributes = ReactNS.MeterHTMLAttributes;
  export import QuoteHTMLAttributes = ReactNS.QuoteHTMLAttributes;
  export import ObjectHTMLAttributes = ReactNS.ObjectHTMLAttributes;
  export import OlHTMLAttributes = ReactNS.OlHTMLAttributes;
  export import OptgroupHTMLAttributes = ReactNS.OptgroupHTMLAttributes;
  export import OptionHTMLAttributes = ReactNS.OptionHTMLAttributes;
  export import OutputHTMLAttributes = ReactNS.OutputHTMLAttributes;
  export import ParamHTMLAttributes = ReactNS.ParamHTMLAttributes;
  export import ProgressHTMLAttributes = ReactNS.ProgressHTMLAttributes;
  export import SelectHTMLAttributes = ReactNS.SelectHTMLAttributes;
  export import SourceHTMLAttributes = ReactNS.SourceHTMLAttributes;
  export import SpanHTMLAttributes = ReactNS.SpanHTMLAttributes;
  export import TableHTMLAttributes = ReactNS.TableHTMLAttributes;
  export import TextareaHTMLAttributes = ReactNS.TextareaHTMLAttributes;
  export import TdHTMLAttributes = ReactNS.TdHTMLAttributes;
  export import ThHTMLAttributes = ReactNS.ThHTMLAttributes;
  export import TimeHTMLAttributes = ReactNS.TimeHTMLAttributes;
  export import TrackHTMLAttributes = ReactNS.TrackHTMLAttributes;
  export import VideoHTMLAttributes = ReactNS.VideoHTMLAttributes;
  export import WbrHTMLAttributes = ReactNS.WbrHTMLAttributes;
  export import SVGProps = ReactNS.SVGProps;
  export import SVGAttributes = ReactNS.SVGAttributes;
  export import DOMAttributes = ReactNS.DOMAttributes;
}

// Add type declarations for Capacitor plugins
declare module '@capacitor/app' {
  export interface AppInfo {
    name: string;
    bundleId: string;
    version: string;
    build: string;
  }
  
  export interface AppState {
    isActive: boolean;
  }
  
  export interface URLOpenListenerEvent {
    url: string;
  }
  
  export interface AppLaunchUrl {
    url?: string;
  }
  
  export class App {
    static exitApp(): void;
    static getInfo(): Promise<AppInfo>;
    static getState(): Promise<AppState>;
    static getLaunchUrl(): Promise<AppLaunchUrl>;
    static minimizeApp(): Promise<void>;
    static addListener(eventName: 'appStateChange', listenerFunc: (state: AppState) => void): Promise<void>;
    static addListener(eventName: 'appUrlOpen', listenerFunc: (event: URLOpenListenerEvent) => void): Promise<void>;
    static addListener(eventName: 'backButton', listenerFunc: () => void): Promise<void>;
    static addListener(eventName: string, listenerFunc: (...args: any[]) => void): Promise<void>;
    static removeAllListeners(): Promise<void>;
  }
}

declare module '@capacitor/splash-screen' {
  export class SplashScreen {
    static hide(): Promise<void>;
    static show(options?: {
      autoHide?: boolean;
      fadeInDuration?: number;
      fadeOutDuration?: number;
      showDuration?: number;
      launchShowDuration?: number;
    }): Promise<void>;
    static showOnLaunch(): void;
  }
}

declare module '@capacitor/core' {
  export interface PluginRegistry {
    // Define plugin registry interface
  }
  
  export class Capacitor {
    static isNativePlatform(): boolean;
    static isWeb(): boolean;
    static getPlatform(): string;
    static platform: string;
  }
}

// Add proper React Router DOM type definitions
declare module 'react-router-dom' {
  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state?: any;
  }

  export interface NavigateFunction {
    (to: string, options?: { replace?: boolean; state?: any }): void;
    (delta: number): void;
  }

  export function useNavigate(): NavigateFunction;
  export function useLocation(): Location;
  export function useLocation<T = any>(): Location & { state: T | undefined };
  export function BrowserRouter(props: any): any;
  export function Routes(props: any): any;
  export function Route(props: any): any;
  export function Navigate(props: any): any;
  export function Outlet(props: any): any;
  export function Link(props: any): any;
  export function NavLink(props: any): any;
  export function useParams<T = {[k: string]: string}>(): T;
  export function useSearchParams(): [URLSearchParams, (newSearchParams: URLSearchParams) => void];
}

declare module '@capacitor/geolocation' {
  export interface Position {
    coords: {
      latitude: number;
      longitude: number;
      accuracy: number;
      altitude?: number;
      altitudeAccuracy?: number;
      heading?: number;
      speed?: number;
    };
    timestamp: number;
  }
  
  export interface PermissionStatus {
    location: 'granted' | 'denied' | 'prompt';
  }
  
  export class Geolocation {
    static requestPermissions(): Promise<PermissionStatus>;
    static getCurrentPosition(): Promise<Position>;
    static watchPosition(callback: (position: Position) => void, options?: any): string;
    static clearWatch(options: { id: string }): Promise<void>;
  }
}

declare module '@capacitor/push-notifications' {
  export interface PushNotificationSchema {
    title?: string;
    subtitle?: string;
    body?: string;
    data?: any;
    finish: (token: string) => void;
  }
  
  export interface Token {
    value: string;
  }
  
  export interface ActionPerformed {
    actionId: string;
    inputValue?: string;
    notification: PushNotificationSchema;
  }
  
  export class PushNotifications {
    static requestPermissions(): Promise<{ granted: boolean }>;
    static register(): Promise<void>;
    static unregister(): Promise<void>;
    static getDeliveredNotifications(): Promise<any[]>;
    static removeDeliveredNotifications(notifications: any[]): Promise<void>;
    static removeAllDeliveredNotifications(): Promise<void>;
    static addListener(eventName: 'registration', listenerFunc: (token: Token) => void): Promise<void>;
    static addListener(eventName: 'error', listenerFunc: (error: any) => void): Promise<void>;
    static addListener(eventName: 'pushNotificationReceived', listenerFunc: (notification: PushNotificationSchema) => void): Promise<void>;
    static addListener(eventName: 'pushNotificationActionPerformed', listenerFunc: (ActionPerformed) => void): Promise<void>;
    static removeAllListeners(): Promise<void>;
  }
}

declare module './lib/pushNotifications' {
  export class PushNotificationService {
    static requestPermission(): Promise<boolean>;
    static registerForNotifications(): Promise<void>;
    static sendTokenToBackend(token: string): Promise<void>;
    static getDeliveredNotifications(): Promise<any[]>;
    static removeDeliveredNotifications(notifications: string[]): Promise<void>;
    static removeAllDeliveredNotifications(): Promise<void>;
    static handleForegroundNotification(notification: any): void;
    static handleNotificationTap(notification: any): void;
  }
}

interface Window {
  Capacitor?: any;
  toast?: any;
}

// Capacitor HTTP plugin type definitions
interface CapacitorHttpRequest {
  url: string;
  method: string;
  headers?: any;
  data?: any;
}

interface CapacitorHttpResponse {
  status: { code: number; text: string } | number;
  headers?: any;
  data: any;
}

interface CapacitorHttpPlugin {
  request(options: CapacitorHttpRequest): Promise<CapacitorHttpResponse>;
}

declare module '@capacitor/http' {
  export const Http: CapacitorHttpPlugin;
}