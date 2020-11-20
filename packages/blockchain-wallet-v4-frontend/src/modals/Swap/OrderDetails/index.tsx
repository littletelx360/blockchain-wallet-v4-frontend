import { compose } from 'redux'
import { connect, ConnectedProps } from 'react-redux'
import { selectors } from 'data'
import React, { PureComponent } from 'react'

import { Props as BaseProps, SuccessStateType } from '..'
import {
  Button,
  Icon,
  SkeletonRectangle,
  Text
} from 'blockchain-info-components'
import { coinToString } from 'core/exchange/currency'
import { convertBaseToStandard } from 'data/components/exchange/services'
import { FlyoutWrapper, Row, Title, Value } from 'components/Flyout'
import { Form, InjectedFormProps, reduxForm } from 'redux-form'
import { FormattedMessage } from 'react-intl'
import { getInput, getOutput } from 'data/components/swap/model'
import { RootState } from 'data/rootReducer'
import { SwapOrderType } from 'core/types'
import { TopText } from '../components'

class OrderDetails extends PureComponent<InjectedFormProps<{}, Props> & Props> {
  state = {}

  networkFee = value => {
    return value
      ? value.coin === 'BTC' || value.coin === 'BCH'
        ? value.selection.fee
        : value.fee
      : 0
  }
  render () {
    if (!this.props.order) return null

    const baseCoin = getInput(this.props.order)
    const counterCoin = getOutput(this.props.order)
    const { coins, handleClose, order } = this.props
    return (
      <>
        <FlyoutWrapper>
          <TopText spaceBetween marginBottom>
            <Text size='20px' color='grey900' weight={600}>
              <FormattedMessage
                id='copy.swap_details'
                defaultMessage='Swap Details'
              />
            </Text>
            <Icon
              onClick={handleClose}
              role='button'
              name='close'
              cursor
              size='24px'
              color='grey600'
            />{' '}
          </TopText>
        </FlyoutWrapper>
        <Row>
          <Title>
            <FormattedMessage
              id='modals.exchangeresults.orderid'
              defaultMessage='Order ID'
            />
          </Title>
          <Value>{order.id}</Value>
        </Row>
        <Row>
          <Title>
            <FormattedMessage
              id='components.txlistitem.status'
              defaultMessage='Status'
            />
          </Title>
          <Value>{order.state}</Value>
        </Row>
        <Row>
          <Title>
            <FormattedMessage id='copy.swap' defaultMessage='Swap' />
          </Title>
          <Value>
            {coinToString({
              value: convertBaseToStandard(
                baseCoin,
                order.priceFunnel.inputMoney
              ),
              unit: { symbol: coins[baseCoin].coinTicker }
            })}
          </Value>
        </Row>
        <Row>
          <Title>
            <FormattedMessage id='buttons.receive' defaultMessage='Receive' />
          </Title>
          <Value>
            {coinToString({
              value: convertBaseToStandard(
                counterCoin,
                this.props.order.priceFunnel.outputMoney
              ),
              unit: { symbol: coins[counterCoin].coinTicker }
            })}
          </Value>
        </Row>
        <Row>
          <Title>
            <FormattedMessage
              id='copy.coin_network_fee'
              defaultMessage='{coin} Network Fee'
              values={{
                coin: coins[baseCoin].coinTicker
              }}
            />
          </Title>
          <Value>
            {this.props.paymentR.cata({
              Success: value => (
                <>
                  {coinToString({
                    value: convertBaseToStandard(
                      baseCoin,
                      this.networkFee(value)
                    ),
                    unit: { symbol: coins[baseCoin].coinTicker }
                  })}
                </>
              ),
              Failure: e => e,
              Loading: () => <SkeletonRectangle height='18px' width='70px' />,
              NotAsked: () => <SkeletonRectangle height='18px' width='70px' />
            })}
          </Value>
        </Row>
        <Row>
          <Title>
            <FormattedMessage
              id='copy.coin_network_fee'
              defaultMessage='{coin} Network Fee'
              values={{
                coin: counterCoin
              }}
            />
          </Title>
          <Value>
            {coinToString({
              unit: { symbol: coins[counterCoin].coinTicker },
              value: convertBaseToStandard(
                counterCoin,
                order.priceFunnel.networkFee
              )
            })}
          </Value>
        </Row>
        {this.props.order.state === 'PENDING_DEPOSIT' && (
          <FlyoutWrapper>
            <Form
              onSubmit={(e: any) => {
                e.preventDefault()
                this.props.swapActions.cancelOrder(order!.id)
              }}
            >
              <Button
                disabled={this.props.submitting}
                data-e2e='cancelOrder'
                type='submit'
                nature='warning'
                fullwidth
                jumbo
              >
                <FormattedMessage
                  id='buttons.cancel_order'
                  defaultMessage='Cancel Order'
                />
              </Button>
            </Form>
          </FlyoutWrapper>
        )}
      </>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  paymentR: selectors.components.swap.getPayment(state)
})

const connector = connect(mapStateToProps)
const enhance = compose(
  reduxForm<{}, Props>({ form: 'swapOrderDetails' }),
  connector
)

type OwnProps = BaseProps &
  SuccessStateType & { handleClose: () => void; order?: SwapOrderType }
export type Props = OwnProps & ConnectedProps<typeof connector>

export default enhance(OrderDetails) as React.ComponentClass<OwnProps>
